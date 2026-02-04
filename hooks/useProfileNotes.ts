"use client";

import { useState, useCallback, useRef } from "react";
import { NostrNote } from "@/lib/graph/types";

// Same relays as useGraphData
const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
];

const NOTES_PER_PAGE = 20;
const RELAY_TIMEOUT = 5000; // Reduced from 10s to 5s
const FIRST_RESULT_TIMEOUT = 2000; // Resolve early if we have results

interface UseProfileNotesResult {
  notes: NostrNote[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  fetchNotes: (pubkey: string) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook to fetch user's posts (kind:1 events) from Nostr relays
 * Streams results progressively as they arrive
 */
export function useProfileNotes(): UseProfileNotesResult {
  const [notes, setNotes] = useState<NostrNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPubkeyRef = useRef<string | null>(null);
  const oldestTimestampRef = useRef<number | null>(null);
  const activeConnectionsRef = useRef<WebSocket[]>([]);

  /**
   * Close all active connections
   */
  const closeConnections = useCallback(() => {
    activeConnectionsRef.current.forEach((ws) => {
      try {
        ws.close();
      } catch {
        // Ignore
      }
    });
    activeConnectionsRef.current = [];
  }, []);

  /**
   * Fetch notes from relays - streams results as they arrive
   */
  const fetchNotesStreaming = useCallback(
    (
      pubkey: string,
      until?: number,
      onNote: (note: NostrNote) => void = () => {},
      onComplete: () => void = () => {}
    ) => {
      const seenIds = new Set<string>();
      let completedRelays = 0;
      let hasReceivedAny = false;

      // Timeout to mark loading complete
      const timeoutId = setTimeout(() => {
        closeConnections();
        onComplete();
      }, RELAY_TIMEOUT);

      // Early completion if we have results
      let earlyTimeoutId: NodeJS.Timeout | null = null;

      for (const relayUrl of RELAYS) {
        try {
          const ws = new WebSocket(relayUrl);
          activeConnectionsRef.current.push(ws);
          const subId = `notes-${Date.now()}-${Math.random()}`;

          ws.onopen = () => {
            const filter: Record<string, unknown> = {
              kinds: [1],
              authors: [pubkey],
              limit: NOTES_PER_PAGE,
            };

            if (until) {
              filter.until = until;
            }

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

                // Deduplicate and stream
                if (!seenIds.has(note.id)) {
                  seenIds.add(note.id);
                  onNote(note);

                  // Start early completion timer on first result
                  if (!hasReceivedAny) {
                    hasReceivedAny = true;
                    earlyTimeoutId = setTimeout(() => {
                      // If we have enough notes, complete early
                      if (seenIds.size >= NOTES_PER_PAGE / 2) {
                        clearTimeout(timeoutId);
                        closeConnections();
                        onComplete();
                      }
                    }, FIRST_RESULT_TIMEOUT);
                  }
                }
              } else if (data[0] === "EOSE") {
                ws.close();
              }
            } catch {
              // Ignore parse errors
            }
          };

          ws.onerror = () => {
            completedRelays++;
            checkComplete();
          };

          ws.onclose = () => {
            completedRelays++;
            checkComplete();
          };

          const checkComplete = () => {
            if (completedRelays >= RELAYS.length) {
              clearTimeout(timeoutId);
              if (earlyTimeoutId) clearTimeout(earlyTimeoutId);
              onComplete();
            }
          };
        } catch {
          completedRelays++;
        }
      }
    },
    [closeConnections]
  );

  /**
   * Fetch initial notes for a pubkey - streams progressively
   */
  const fetchNotes = useCallback(
    async (pubkey: string) => {
      // Close any existing connections
      closeConnections();

      setIsLoading(true);
      setError(null);
      setNotes([]);
      setHasMore(true);
      currentPubkeyRef.current = pubkey;
      oldestTimestampRef.current = null;

      const notesBuffer: NostrNote[] = [];

      fetchNotesStreaming(
        pubkey,
        undefined,
        // onNote - called for each note as it arrives
        (note) => {
          notesBuffer.push(note);
          // Update UI with sorted notes
          const sorted = [...notesBuffer].sort(
            (a, b) => b.created_at - a.created_at
          );
          setNotes(sorted);

          // Update oldest timestamp
          if (sorted.length > 0) {
            oldestTimestampRef.current = sorted[sorted.length - 1].created_at;
          }
        },
        // onComplete - called when all relays finish
        () => {
          setIsLoading(false);
          setHasMore(notesBuffer.length >= NOTES_PER_PAGE);
        }
      );
    },
    [fetchNotesStreaming, closeConnections]
  );

  /**
   * Load more notes (pagination)
   */
  const loadMore = useCallback(async () => {
    if (
      !currentPubkeyRef.current ||
      !oldestTimestampRef.current ||
      isLoading ||
      !hasMore
    ) {
      return;
    }

    setIsLoading(true);
    const existingIds = new Set(notes.map((n) => n.id));
    const newNotesBuffer: NostrNote[] = [];

    fetchNotesStreaming(
      currentPubkeyRef.current,
      oldestTimestampRef.current - 1,
      // onNote
      (note) => {
        if (!existingIds.has(note.id)) {
          newNotesBuffer.push(note);
          existingIds.add(note.id);

          // Update UI progressively
          setNotes((prev) => {
            const combined = [...prev, ...newNotesBuffer];
            return combined.sort((a, b) => b.created_at - a.created_at);
          });

          // Update oldest timestamp
          const allSorted = [...notes, ...newNotesBuffer].sort(
            (a, b) => b.created_at - a.created_at
          );
          if (allSorted.length > 0) {
            oldestTimestampRef.current =
              allSorted[allSorted.length - 1].created_at;
          }
        }
      },
      // onComplete
      () => {
        setIsLoading(false);
        setHasMore(newNotesBuffer.length >= NOTES_PER_PAGE);
      }
    );
  }, [fetchNotesStreaming, notes, isLoading, hasMore]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    closeConnections();
    setNotes([]);
    setIsLoading(false);
    setHasMore(true);
    setError(null);
    currentPubkeyRef.current = null;
    oldestTimestampRef.current = null;
  }, [closeConnections]);

  return {
    notes,
    isLoading,
    hasMore,
    error,
    fetchNotes,
    loadMore,
    reset,
  };
}
