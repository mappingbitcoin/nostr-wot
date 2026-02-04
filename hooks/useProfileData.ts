"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { NodeProfile } from "@/lib/graph/types";

// Fast relays for profile fetching
const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://purplepag.es",
];

const FETCH_TIMEOUT = 5000;

interface UseProfileDataResult {
  profile: NodeProfile | null;
  followingCount: number | null;
  isLoadingProfile: boolean;
  isLoadingFollowing: boolean;
  fetchProfile: (pubkey: string) => void;
  reset: () => void;
}

/**
 * Hook to fetch profile data (kind:0) and following list (kind:3) progressively
 * Shows data as soon as it arrives from any relay
 */
export function useProfileData(): UseProfileDataResult {
  const [profile, setProfile] = useState<NodeProfile | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);

  const activeConnectionsRef = useRef<WebSocket[]>([]);
  const currentPubkeyRef = useRef<string | null>(null);

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
   * Fetch profile and following data progressively
   */
  const fetchProfile = useCallback(
    (pubkey: string) => {
      // Close existing connections
      closeConnections();

      // Reset state
      setProfile(null);
      setFollowingCount(null);
      setIsLoadingProfile(true);
      setIsLoadingFollowing(true);
      currentPubkeyRef.current = pubkey;

      let profileReceived = false;
      let followsReceived = false;
      let profileCompletedRelays = 0;
      let followsCompletedRelays = 0;

      // Timeout fallback
      const timeoutId = setTimeout(() => {
        closeConnections();
        setIsLoadingProfile(false);
        setIsLoadingFollowing(false);
      }, FETCH_TIMEOUT);

      for (const relayUrl of RELAYS) {
        // Profile connection (kind:0)
        try {
          const profileWs = new WebSocket(relayUrl);
          activeConnectionsRef.current.push(profileWs);
          const profileSubId = `profile-${Date.now()}-${Math.random()}`;

          profileWs.onopen = () => {
            profileWs.send(
              JSON.stringify([
                "REQ",
                profileSubId,
                { kinds: [0], authors: [pubkey], limit: 1 },
              ])
            );
          };

          profileWs.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data[0] === "EVENT" && data[2]?.kind === 0 && !profileReceived) {
                const content = JSON.parse(data[2].content);
                const newProfile: NodeProfile = {
                  pubkey: data[2].pubkey,
                  name: content.name,
                  displayName: content.display_name,
                  picture: content.picture,
                  about: content.about,
                  nip05: content.nip05,
                };
                profileReceived = true;
                setProfile(newProfile);
                setIsLoadingProfile(false);
                profileWs.close();
              } else if (data[0] === "EOSE") {
                profileWs.close();
              }
            } catch {
              // Ignore
            }
          };

          profileWs.onerror = () => {
            profileCompletedRelays++;
            if (profileCompletedRelays >= RELAYS.length && !profileReceived) {
              setIsLoadingProfile(false);
            }
          };

          profileWs.onclose = () => {
            profileCompletedRelays++;
            if (profileCompletedRelays >= RELAYS.length && !profileReceived) {
              setIsLoadingProfile(false);
            }
          };
        } catch {
          profileCompletedRelays++;
        }

        // Follows connection (kind:3)
        try {
          const followsWs = new WebSocket(relayUrl);
          activeConnectionsRef.current.push(followsWs);
          const followsSubId = `follows-${Date.now()}-${Math.random()}`;

          followsWs.onopen = () => {
            followsWs.send(
              JSON.stringify([
                "REQ",
                followsSubId,
                { kinds: [3], authors: [pubkey], limit: 1 },
              ])
            );
          };

          followsWs.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data[0] === "EVENT" && data[2]?.kind === 3 && !followsReceived) {
                // Count "p" tags (follows)
                const tags = data[2].tags || [];
                const pTags = tags.filter(
                  (tag: string[]) => tag[0] === "p" && tag[1]
                );
                followsReceived = true;
                setFollowingCount(pTags.length);
                setIsLoadingFollowing(false);
                followsWs.close();
              } else if (data[0] === "EOSE") {
                followsWs.close();
              }
            } catch {
              // Ignore
            }
          };

          followsWs.onerror = () => {
            followsCompletedRelays++;
            if (followsCompletedRelays >= RELAYS.length && !followsReceived) {
              setIsLoadingFollowing(false);
            }
          };

          followsWs.onclose = () => {
            followsCompletedRelays++;
            if (followsCompletedRelays >= RELAYS.length && !followsReceived) {
              setIsLoadingFollowing(false);
            }
          };
        } catch {
          followsCompletedRelays++;
        }
      }

      // Clean up timeout when both complete
      const checkComplete = setInterval(() => {
        if (!isLoadingProfile && !isLoadingFollowing) {
          clearTimeout(timeoutId);
          clearInterval(checkComplete);
        }
      }, 100);
    },
    [closeConnections]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    closeConnections();
    setProfile(null);
    setFollowingCount(null);
    setIsLoadingProfile(false);
    setIsLoadingFollowing(false);
    currentPubkeyRef.current = null;
  }, [closeConnections]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeConnections();
    };
  }, [closeConnections]);

  return {
    profile,
    followingCount,
    isLoadingProfile,
    isLoadingFollowing,
    fetchProfile,
    reset,
  };
}
