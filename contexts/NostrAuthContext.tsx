"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type AuthMode = "write" | "read";

interface NostrUser {
    pubkey: string;
    mode: AuthMode;
    method: "nsec" | "npub" | "extension" | "bunker" | "remote";
}

export interface NostrProfile {
    name?: string;
    display_name?: string;
    picture?: string;
    about?: string;
    nip05?: string;
}

interface NostrAuthContextType {
    user: NostrUser | null;
    profile: NostrProfile | null;
    isLoading: boolean;
    error: string | null;
    loginWithKey: (key: string) => Promise<void>;
    loginWithExtension: () => Promise<void>;
    loginWithBunker: (bunkerUrl: string) => Promise<void>;
    loginWithRemoteSigner: (remotePubkey: string) => void;
    logout: () => void;
    clearError: () => void;
}

const NostrAuthContext = createContext<NostrAuthContextType | undefined>(undefined);

const STORAGE_KEY = "nostr_auth";

// Helper to decode bech32 (nsec/npub) to hex
function bech32ToHex(bech32: string): { type: "nsec" | "npub"; hex: string } | null {
    try {
        const ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
        const lower = bech32.toLowerCase();
        const prefix = lower.startsWith("nsec") ? "nsec" : lower.startsWith("npub") ? "npub" : null;
        if (!prefix) return null;

        const data = lower.slice(prefix.length + 1); // skip prefix and separator
        const values: number[] = [];
        for (const char of data) {
            const idx = ALPHABET.indexOf(char);
            if (idx === -1) return null;
            values.push(idx);
        }

        // Convert 5-bit to 8-bit
        let acc = 0;
        let bits = 0;
        const bytes: number[] = [];
        for (const value of values.slice(0, -6)) { // exclude checksum
            acc = (acc << 5) | value;
            bits += 5;
            while (bits >= 8) {
                bits -= 8;
                bytes.push((acc >> bits) & 0xff);
            }
        }

        const hex = bytes.map(b => b.toString(16).padStart(2, "0")).join("");
        return { type: prefix as "nsec" | "npub", hex };
    } catch {
        return null;
    }
}

// Derive pubkey from private key using secp256k1
async function derivePublicKey(privateKeyHex: string): Promise<string> {
    const { getPublicKey } = await import("@noble/secp256k1");
    // Convert hex to bytes
    const privateKeyBytes = new Uint8Array(
        privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    const pubkeyBytes = getPublicKey(privateKeyBytes);
    // Convert to hex, skip the first byte (compression prefix)
    return Array.from(pubkeyBytes.slice(1, 33))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// Fetch user profile from relays (NIP-01 kind:0)
const PROFILE_RELAYS = [
    "wss://relay.damus.io",
    "wss://relay.nostr.band",
    "wss://nos.lol",
    "wss://relay.snort.social",
];

function fetchProfileFromRelay(relayUrl: string, pubkey: string): Promise<NostrProfile | null> {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            ws.close();
            resolve(null);
        }, 5000);

        const ws = new WebSocket(relayUrl);

        ws.onopen = () => {
            const subId = `profile-${Date.now()}`;
            ws.send(JSON.stringify(["REQ", subId, {
                kinds: [0],
                authors: [pubkey],
                limit: 1,
            }]));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data[0] === "EVENT" && data[2]?.kind === 0) {
                    clearTimeout(timeout);
                    ws.close();
                    const content = JSON.parse(data[2].content);
                    resolve(content);
                } else if (data[0] === "EOSE") {
                    clearTimeout(timeout);
                    ws.close();
                    resolve(null);
                }
            } catch {
                // Ignore parse errors
            }
        };

        ws.onerror = () => {
            clearTimeout(timeout);
            resolve(null);
        };
    });
}

async function fetchNostrProfile(pubkey: string): Promise<NostrProfile | null> {
    for (const relayUrl of PROFILE_RELAYS) {
        try {
            const profile = await fetchProfileFromRelay(relayUrl, pubkey);
            if (profile) return profile;
        } catch (e) {
            console.warn(`Failed to fetch profile from ${relayUrl}:`, e);
        }
    }
    return null;
}

export function NostrAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<NostrUser | null>(null);
    const [profile, setProfile] = useState<NostrProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load user from storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setUser(parsed);
            }
        } catch (e) {
            console.error("Failed to load auth state:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Persist user to storage
    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [user]);

    // Fetch user profile when user changes
    useEffect(() => {
        if (user?.pubkey) {
            fetchNostrProfile(user.pubkey).then(setProfile);
        } else {
            setProfile(null);
        }
    }, [user?.pubkey]);

    const loginWithKey = useCallback(async (key: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const trimmedKey = key.trim();

            // Check if it's a bech32 key
            if (trimmedKey.startsWith("nsec") || trimmedKey.startsWith("npub")) {
                const decoded = bech32ToHex(trimmedKey);
                if (!decoded) {
                    setError("Invalid key format");
                    return;
                }

                if (decoded.type === "npub") {
                    // Read-only mode with npub
                    setUser({
                        pubkey: decoded.hex,
                        mode: "read",
                        method: "npub",
                    });
                } else {
                    // Write mode with nsec
                    const pubkey = await derivePublicKey(decoded.hex);
                    // Store private key in session (cleared on tab close)
                    sessionStorage.setItem("nostr_privkey", decoded.hex);
                    setUser({
                        pubkey,
                        mode: "write",
                        method: "nsec",
                    });
                }
            } else if (/^[0-9a-fA-F]{64}$/.test(trimmedKey)) {
                // Raw hex key - assume it's a private key
                const pubkey = await derivePublicKey(trimmedKey);
                sessionStorage.setItem("nostr_privkey", trimmedKey);
                setUser({
                    pubkey,
                    mode: "write",
                    method: "nsec",
                });
            } else {
                setError("Invalid key format. Please enter an nsec, npub, or hex key.");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to login with key");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loginWithExtension = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (typeof window === "undefined" || !window.nostr) {
                setError("No Nostr extension found. Please install Alby or nos2x.");
                return;
            }

            const pubkey = await window.nostr.getPublicKey();
            if (!pubkey) {
                setError("Failed to get public key from extension");
                return;
            }

            setUser({
                pubkey,
                mode: "write",
                method: "extension",
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to login with extension");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loginWithBunker = useCallback(async (bunkerUrl: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // Parse bunker URL: bunker://<pubkey>?relay=<relay>&secret=<secret>
            const url = new URL(bunkerUrl);
            const pubkey = url.hostname || url.pathname.replace("//", "");

            if (!pubkey || pubkey.length !== 64) {
                setError("Invalid bunker URL");
                return;
            }

            // Store bunker connection info
            sessionStorage.setItem("nostr_bunker", bunkerUrl);

            setUser({
                pubkey,
                mode: "write",
                method: "bunker",
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to connect to bunker");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loginWithRemoteSigner = useCallback((remotePubkey: string) => {
        // This is called when the Nostr Connect QR flow completes
        // The session data is already stored by the connect library
        setUser({
            pubkey: remotePubkey,
            mode: "write",
            method: "remote",
        });
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setProfile(null);
        sessionStorage.removeItem("nostr_privkey");
        sessionStorage.removeItem("nostr_bunker");
        sessionStorage.removeItem("nostr_connect_session");
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <NostrAuthContext.Provider
            value={{
                user,
                profile,
                isLoading,
                error,
                loginWithKey,
                loginWithExtension,
                loginWithBunker,
                loginWithRemoteSigner,
                logout,
                clearError,
            }}
        >
            {children}
        </NostrAuthContext.Provider>
    );
}

export function useNostrAuth() {
    const context = useContext(NostrAuthContext);
    if (context === undefined) {
        throw new Error("useNostrAuth must be used within a NostrAuthProvider");
    }
    return context;
}
