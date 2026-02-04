"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { NodeProfile, NostrNote } from "@/lib/graph/types";

// Same relays as useGraphData
const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
];

const RELAY_TIMEOUT = 5000; // Reduced from 10s to 5s

interface UseUserProfileResult {
  profile: NodeProfile | null;
  follows: string[];
  followProfiles: Map<string, NodeProfile>;
  notes: NostrNote[];
  isLoading: boolean;
  isLoadingNotes: boolean;
  error: string | null;
  fetchUserData: (pubkey: string) => Promise<void>;
  fetchMoreNotes: () => Promise<void>;
  hasMoreNotes: boolean;
}

/**
 * Hook to fetch complete user data from Nostr relays
 */
export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<NodeProfile | null>(null);
  const [follows, setFollows] = useState<string[]>([]);
  const [followProfiles, setFollowProfiles] = useState<Map<string, NodeProfile>>(
    new Map()
  );
  const [notes, setNotes] = useState<NostrNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreNotes, setHasMoreNotes] = useState(true);

  const currentPubkeyRef = useRef<string | null>(null);
  const oldestNoteTimestampRef = useRef<number | null>(null);

  /**
   * Fetch profile (kind 0)
   */
  const fetchProfile = useCallback(
    async (pubkey: string): Promise<NodeProfile | null> => {
      return new Promise((resolve) => {
        let profile: NodeProfile | null = null;
        let resolved = false;
        let completedRelays = 0;

        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(profile);
          }
        }, RELAY_TIMEOUT);

        for (const relayUrl of RELAYS.slice(0, 2)) {
          try {
            const ws = new WebSocket(relayUrl);
            const subId = `profile-${Date.now()}-${Math.random()}`;

            ws.onopen = () => {
              ws.send(
                JSON.stringify([
                  "REQ",
                  subId,
                  { kinds: [0], authors: [pubkey], limit: 1 },
                ])
              );
            };

            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data[0] === "EVENT" && data[2]?.kind === 0) {
                  const content = JSON.parse(data[2].content);
                  profile = {
                    pubkey,
                    name: content.name,
                    displayName: content.display_name,
                    picture: content.picture,
                    about: content.about,
                    nip05: content.nip05,
                  };
                } else if (data[0] === "EOSE") {
                  ws.close();
                }
              } catch {
                // Ignore parse errors
              }
            };

            ws.onerror = () => {
              completedRelays++;
              if (completedRelays >= 2 && !resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                resolve(profile);
              }
            };

            ws.onclose = () => {
              completedRelays++;
              if (completedRelays >= 2 && !resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                resolve(profile);
              }
            };
          } catch {
            completedRelays++;
          }
        }
      });
    },
    []
  );

  /**
   * Fetch follows (kind 3)
   */
  const fetchFollows = useCallback(async (pubkey: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const follows = new Set<string>();
      let resolved = false;
      let completedRelays = 0;

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(Array.from(follows));
        }
      }, RELAY_TIMEOUT);

      for (const relayUrl of RELAYS) {
        try {
          const ws = new WebSocket(relayUrl);
          const subId = `follows-${Date.now()}-${Math.random()}`;

          ws.onopen = () => {
            ws.send(
              JSON.stringify([
                "REQ",
                subId,
                { kinds: [3], authors: [pubkey], limit: 1 },
              ])
            );
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data[0] === "EVENT" && data[2]?.kind === 3) {
                const tags = data[2].tags || [];
                for (const tag of tags) {
                  if (tag[0] === "p" && tag[1]) {
                    follows.add(tag[1]);
                  }
                }
              } else if (data[0] === "EOSE") {
                ws.close();
              }
            } catch {
              // Ignore
            }
          };

          ws.onerror = () => {
            completedRelays++;
            if (completedRelays >= RELAYS.length && !resolved) {
              clearTimeout(timeoutId);
              resolved = true;
              resolve(Array.from(follows));
            }
          };

          ws.onclose = () => {
            completedRelays++;
            if (completedRelays >= RELAYS.length && !resolved) {
              clearTimeout(timeoutId);
              resolved = true;
              resolve(Array.from(follows));
            }
          };
        } catch {
          completedRelays++;
        }
      }
    });
  }, []);

  /**
   * Fetch profiles for multiple pubkeys
   */
  const fetchProfiles = useCallback(
    async (pubkeys: string[]): Promise<Map<string, NodeProfile>> => {
      const profiles = new Map<string, NodeProfile>();

      if (pubkeys.length === 0) return profiles;

      return new Promise((resolve) => {
        let resolved = false;
        let completedRelays = 0;

        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(profiles);
          }
        }, RELAY_TIMEOUT);

        // Batch in chunks of 50
        const chunks: string[][] = [];
        for (let i = 0; i < pubkeys.length; i += 50) {
          chunks.push(pubkeys.slice(i, i + 50));
        }

        for (const relayUrl of RELAYS.slice(0, 2)) {
          try {
            const ws = new WebSocket(relayUrl);

            ws.onopen = () => {
              for (let i = 0; i < chunks.length; i++) {
                const subId = `profiles-${Date.now()}-${i}`;
                ws.send(
                  JSON.stringify([
                    "REQ",
                    subId,
                    { kinds: [0], authors: chunks[i], limit: chunks[i].length },
                  ])
                );
              }
            };

            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data[0] === "EVENT" && data[2]?.kind === 0) {
                  const pubkey = data[2].pubkey;
                  const content = JSON.parse(data[2].content);
                  profiles.set(pubkey, {
                    pubkey,
                    name: content.name,
                    displayName: content.display_name,
                    picture: content.picture,
                    about: content.about,
                    nip05: content.nip05,
                  });
                }
              } catch {
                // Ignore
              }
            };

            ws.onerror = () => {
              completedRelays++;
              if (completedRelays >= 2 && !resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                resolve(profiles);
              }
            };

            ws.onclose = () => {
              completedRelays++;
              if (completedRelays >= 2 && !resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                resolve(profiles);
              }
            };

            setTimeout(() => ws.close(), RELAY_TIMEOUT - 1000);
          } catch {
            completedRelays++;
          }
        }
      });
    },
    []
  );

  /**
   * Fetch notes (kind 1)
   */
  const fetchNotes = useCallback(
    async (pubkey: string, until?: number): Promise<NostrNote[]> => {
      return new Promise((resolve) => {
        const notesMap = new Map<string, NostrNote>();
        let resolved = false;
        let completedRelays = 0;

        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(Array.from(notesMap.values()));
          }
        }, RELAY_TIMEOUT);

        for (const relayUrl of RELAYS) {
          try {
            const ws = new WebSocket(relayUrl);
            const subId = `notes-${Date.now()}-${Math.random()}`;

            ws.onopen = () => {
              const filter: Record<string, unknown> = {
                kinds: [1],
                authors: [pubkey],
                limit: 20,
              };
              if (until) filter.until = until;
              ws.send(JSON.stringify(["REQ", subId, filter]));
            };

            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data[0] === "EVENT" && data[2]?.kind === 1) {
                  const note: NostrNote = {
                    id: data[2].id,
                    pubkey: data[2].pubkey,
                    content: data[2].content,
                    created_at: data[2].created_at,
                    tags: data[2].tags || [],
                    kind: 1,
                    sig: data[2].sig,
                  };
                  if (!notesMap.has(note.id)) {
                    notesMap.set(note.id, note);
                  }
                } else if (data[0] === "EOSE") {
                  ws.close();
                }
              } catch {
                // Ignore
              }
            };

            ws.onerror = () => {
              completedRelays++;
              if (completedRelays >= RELAYS.length && !resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                resolve(Array.from(notesMap.values()));
              }
            };

            ws.onclose = () => {
              completedRelays++;
              if (completedRelays >= RELAYS.length && !resolved) {
                clearTimeout(timeoutId);
                resolved = true;
                resolve(Array.from(notesMap.values()));
              }
            };
          } catch {
            completedRelays++;
          }
        }
      });
    },
    []
  );

  /**
   * Fetch all user data - streams progressively as data arrives
   */
  const fetchUserData = useCallback(
    async (pubkey: string) => {
      // Reset state
      setIsLoading(true);
      setError(null);
      setProfile(null);
      setFollows([]);
      setFollowProfiles(new Map());
      setNotes([]);
      setHasMoreNotes(true);
      currentPubkeyRef.current = pubkey;
      oldestNoteTimestampRef.current = null;

      // Track completion for loading state
      let profileDone = false;
      let followsDone = false;
      let notesDone = false;

      const checkAllDone = () => {
        if (profileDone && followsDone && notesDone) {
          setIsLoading(false);
        }
      };

      // Fetch profile - show immediately when received
      fetchProfile(pubkey).then((fetchedProfile) => {
        profileDone = true;
        setProfile(
          fetchedProfile || {
            pubkey,
            name: undefined,
            displayName: undefined,
            picture: undefined,
            about: undefined,
            nip05: undefined,
          }
        );
        checkAllDone();
      });

      // Fetch follows - show immediately and start loading profiles
      fetchFollows(pubkey).then((fetchedFollows) => {
        followsDone = true;
        setFollows(fetchedFollows);
        checkAllDone();

        // Start streaming follow profiles (don't wait)
        if (fetchedFollows.length > 0) {
          streamFollowProfiles(fetchedFollows.slice(0, 100));
        }
      });

      // Fetch notes - stream as they arrive
      fetchNotesStreaming(pubkey);
      // Mark notes as done after timeout (streaming continues)
      setTimeout(() => {
        notesDone = true;
        checkAllDone();
      }, RELAY_TIMEOUT);
    },
    [fetchProfile, fetchFollows]
  );

  /**
   * Stream notes as they arrive from relays
   */
  const fetchNotesStreaming = useCallback((pubkey: string, until?: number) => {
    const notesBuffer: NostrNote[] = [];
    const seenIds = new Set<string>();
    let completedRelays = 0;

    for (const relayUrl of RELAYS) {
      try {
        const ws = new WebSocket(relayUrl);
        const subId = `notes-${Date.now()}-${Math.random()}`;

        ws.onopen = () => {
          const filter: Record<string, unknown> = {
            kinds: [1],
            authors: [pubkey],
            limit: 20,
          };
          if (until) filter.until = until;
          ws.send(JSON.stringify(["REQ", subId, filter]));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data[0] === "EVENT" && data[2]?.kind === 1) {
              const note: NostrNote = {
                id: data[2].id,
                pubkey: data[2].pubkey,
                content: data[2].content,
                created_at: data[2].created_at,
                tags: data[2].tags || [],
                kind: 1,
                sig: data[2].sig,
              };

              if (!seenIds.has(note.id)) {
                seenIds.add(note.id);
                notesBuffer.push(note);

                // Update UI with sorted notes
                const sorted = [...notesBuffer].sort(
                  (a, b) => b.created_at - a.created_at
                );
                setNotes(sorted);

                // Update oldest timestamp
                if (sorted.length > 0) {
                  oldestNoteTimestampRef.current =
                    sorted[sorted.length - 1].created_at;
                }
              }
            } else if (data[0] === "EOSE") {
              ws.close();
            }
          } catch {
            // Ignore
          }
        };

        ws.onerror = () => {
          completedRelays++;
          if (completedRelays >= RELAYS.length) {
            setHasMoreNotes(notesBuffer.length >= 20);
          }
        };

        ws.onclose = () => {
          completedRelays++;
          if (completedRelays >= RELAYS.length) {
            setHasMoreNotes(notesBuffer.length >= 20);
          }
        };
      } catch {
        completedRelays++;
      }
    }
  }, []);

  /**
   * Stream follow profiles progressively
   */
  const streamFollowProfiles = useCallback((pubkeys: string[]) => {
    const profiles = new Map<string, NodeProfile>();
    let completedRelays = 0;

    // Batch in chunks of 50
    const chunks: string[][] = [];
    for (let i = 0; i < pubkeys.length; i += 50) {
      chunks.push(pubkeys.slice(i, i + 50));
    }

    for (const relayUrl of RELAYS.slice(0, 2)) {
      try {
        const ws = new WebSocket(relayUrl);

        ws.onopen = () => {
          for (let i = 0; i < chunks.length; i++) {
            const subId = `profiles-${Date.now()}-${i}`;
            ws.send(
              JSON.stringify([
                "REQ",
                subId,
                { kinds: [0], authors: chunks[i], limit: chunks[i].length },
              ])
            );
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data[0] === "EVENT" && data[2]?.kind === 0) {
              const pubkey = data[2].pubkey;
              const content = JSON.parse(data[2].content);
              profiles.set(pubkey, {
                pubkey,
                name: content.name,
                displayName: content.display_name,
                picture: content.picture,
                about: content.about,
                nip05: content.nip05,
              });

              // Update UI progressively
              setFollowProfiles(new Map(profiles));
            }
          } catch {
            // Ignore
          }
        };

        ws.onerror = () => {
          completedRelays++;
        };

        ws.onclose = () => {
          completedRelays++;
        };

        setTimeout(() => ws.close(), RELAY_TIMEOUT - 1000);
      } catch {
        completedRelays++;
      }
    }
  }, []);

  /**
   * Load more notes - streams progressively
   */
  const fetchMoreNotes = useCallback(async () => {
    if (
      !currentPubkeyRef.current ||
      !oldestNoteTimestampRef.current ||
      isLoadingNotes ||
      !hasMoreNotes
    ) {
      return;
    }

    setIsLoadingNotes(true);

    const pubkey = currentPubkeyRef.current;
    const until = oldestNoteTimestampRef.current - 1;
    const existingIds = new Set(notes.map((n) => n.id));
    const newNotesBuffer: NostrNote[] = [];
    let completedRelays = 0;

    for (const relayUrl of RELAYS) {
      try {
        const ws = new WebSocket(relayUrl);
        const subId = `more-notes-${Date.now()}-${Math.random()}`;

        ws.onopen = () => {
          ws.send(
            JSON.stringify([
              "REQ",
              subId,
              { kinds: [1], authors: [pubkey], limit: 20, until },
            ])
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data[0] === "EVENT" && data[2]?.kind === 1) {
              const note: NostrNote = {
                id: data[2].id,
                pubkey: data[2].pubkey,
                content: data[2].content,
                created_at: data[2].created_at,
                tags: data[2].tags || [],
                kind: 1,
                sig: data[2].sig,
              };

              if (!existingIds.has(note.id) && !newNotesBuffer.some(n => n.id === note.id)) {
                existingIds.add(note.id);
                newNotesBuffer.push(note);

                // Update UI progressively
                setNotes((prev) => {
                  const combined = [...prev, ...newNotesBuffer];
                  return combined.sort((a, b) => b.created_at - a.created_at);
                });

                // Update oldest timestamp
                const sorted = [...newNotesBuffer].sort((a, b) => b.created_at - a.created_at);
                if (sorted.length > 0) {
                  oldestNoteTimestampRef.current = sorted[sorted.length - 1].created_at;
                }
              }
            } else if (data[0] === "EOSE") {
              ws.close();
            }
          } catch {
            // Ignore
          }
        };

        ws.onerror = () => {
          completedRelays++;
          if (completedRelays >= RELAYS.length) {
            setIsLoadingNotes(false);
            setHasMoreNotes(newNotesBuffer.length >= 20);
          }
        };

        ws.onclose = () => {
          completedRelays++;
          if (completedRelays >= RELAYS.length) {
            setIsLoadingNotes(false);
            setHasMoreNotes(newNotesBuffer.length >= 20);
          }
        };
      } catch {
        completedRelays++;
      }
    }
  }, [notes, isLoadingNotes, hasMoreNotes]);

  return {
    profile,
    follows,
    followProfiles,
    notes,
    isLoading,
    isLoadingNotes,
    error,
    fetchUserData,
    fetchMoreNotes,
    hasMoreNotes,
  };
}
