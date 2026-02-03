import {
    generatePrivateKey,
    getPublicKey,
    nip04Decrypt,
    nip04Encrypt,
    getEventHash,
    signEvent,
    generateSecret,
    type NostrEvent,
} from "./crypto";

export interface NostrConnectSession {
    clientPrivateKey: string;
    clientPubkey: string;
    relay: string;
    secret: string;
    remotePubkey?: string;
    ws?: WebSocket;
}

export interface NostrConnectCallbacks {
    onConnected: (remotePubkey: string) => void;
    onError: (error: string) => void;
    onTimeout: () => void;
}

const DEFAULT_RELAY = "wss://relay.mappingbitcoin.com";
const CONNECTION_TIMEOUT = 120000; // 2 minutes

// Generate nostrconnect:// URI for QR code
export function generateNostrConnectURI(session: NostrConnectSession, appName: string): string {
    const params = new URLSearchParams({
        relay: session.relay,
        secret: session.secret,
        name: appName,
    });

    return `nostrconnect://${session.clientPubkey}?${params.toString()}`;
}

// Create a new Nostr Connect session
export function createNostrConnectSession(relay: string = DEFAULT_RELAY): NostrConnectSession {
    const clientPrivateKey = generatePrivateKey();
    const clientPubkey = getPublicKey(clientPrivateKey);
    const secret = generateSecret();

    return {
        clientPrivateKey,
        clientPubkey,
        relay,
        secret,
    };
}

// Start listening for connection on the relay
export function startNostrConnect(
    session: NostrConnectSession,
    callbacks: NostrConnectCallbacks
): () => void {
    let ws: WebSocket | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isConnected = false;

    const cleanup = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (ws) {
            ws.close();
            ws = null;
        }
    };

    console.log("[NostrConnect] Starting connection to relay:", session.relay);
    console.log("[NostrConnect] Client pubkey:", session.clientPubkey);
    console.log("[NostrConnect] Secret:", session.secret);

    try {
        ws = new WebSocket(session.relay);
        session.ws = ws;

        ws.onopen = () => {
            console.log("[NostrConnect] WebSocket connected to relay");

            // Subscribe to events addressed to our ephemeral pubkey
            const subId = `nostrconnect-${Date.now()}`;
            const filter = {
                kinds: [24133], // NIP-46 response kind
                "#p": [session.clientPubkey],
            };

            console.log("[NostrConnect] Subscribing with filter:", JSON.stringify(filter));
            console.log("[NostrConnect] Waiting for events tagged with p:", session.clientPubkey);
            ws?.send(JSON.stringify(["REQ", subId, filter]));

            // Set connection timeout
            timeoutId = setTimeout(() => {
                if (!isConnected) {
                    console.log("[NostrConnect] Connection timeout after 2 minutes");
                    cleanup();
                    callbacks.onTimeout();
                }
            }, CONNECTION_TIMEOUT);
        };

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("[NostrConnect] Received message:", data[0], data[1] || "");

                if (data[0] === "EOSE") {
                    console.log("[NostrConnect] End of stored events, waiting for new events...");
                }

                if (data[0] === "OK") {
                    console.log("[NostrConnect] Event acknowledged by relay:", data[1], data[2] ? "success" : "failed", data[3] || "");
                }

                if (data[0] === "EVENT") {
                    const nostrEvent: NostrEvent = data[2];

                    console.log("[NostrConnect] Received NIP-46 event from:", nostrEvent.pubkey);
                    console.log("[NostrConnect] Event kind:", nostrEvent.kind);
                    console.log("[NostrConnect] Event tags:", JSON.stringify(nostrEvent.tags));
                    console.log("[NostrConnect] Content length:", nostrEvent.content.length);
                    console.log("[NostrConnect] Raw content:", nostrEvent.content.substring(0, 200));

                    try {
                        // Decrypt the content
                        const decrypted = await nip04Decrypt(
                            session.clientPrivateKey,
                            nostrEvent.pubkey,
                            nostrEvent.content
                        );

                        console.log("[NostrConnect] Decrypted content:", decrypted);

                        const response = JSON.parse(decrypted);
                        console.log("[NostrConnect] Parsed response:", JSON.stringify(response));

                        // Check if this is a successful connect response
                        // NIP-46 responses can vary by implementation:
                        // - {"id": "...", "result": "ack"}
                        // - {"id": "...", "result": "<secret>"}
                        // - {"id": "...", "result": "<remote-pubkey>"}
                        // - {"method": "connect", "params": [...]}
                        // - Any response with a result that's not an error
                        const isConnectResponse =
                            response.result === "ack" ||
                            response.result === session.secret ||
                            response.method === "connect" ||
                            (response.result && !response.error) || // Accept any successful result
                            (response.id && response.result !== undefined); // Accept any response with id and result

                        console.log("[NostrConnect] Is connect response:", isConnectResponse);
                        console.log("[NostrConnect] Checking: result='ack':", response.result === "ack");
                        console.log("[NostrConnect] Checking: result=secret:", response.result === session.secret);
                        console.log("[NostrConnect] Checking: method='connect':", response.method === "connect");
                        console.log("[NostrConnect] Checking: has result no error:", response.result && !response.error);

                        if (isConnectResponse) {
                            isConnected = true;
                            session.remotePubkey = nostrEvent.pubkey;

                            // Store the session for future signing requests
                            sessionStorage.setItem("nostr_connect_session", JSON.stringify({
                                clientPrivateKey: session.clientPrivateKey,
                                clientPubkey: session.clientPubkey,
                                remotePubkey: nostrEvent.pubkey,
                                relay: session.relay,
                            }));

                            console.log("[NostrConnect] Successfully connected! Remote pubkey:", nostrEvent.pubkey);
                            cleanup();
                            callbacks.onConnected(nostrEvent.pubkey);
                        } else {
                            console.log("[NostrConnect] Response did not match connect criteria");
                        }
                    } catch (decryptErr) {
                        console.error("[NostrConnect] Failed to decrypt/parse content:", decryptErr);
                    }
                }
            } catch (err) {
                console.error("[NostrConnect] Error processing message:", err);
            }
        };

        ws.onerror = (error) => {
            console.error("[NostrConnect] WebSocket error:", error);
            cleanup();
            callbacks.onError("Connection failed. Please try again.");
        };

        ws.onclose = (event) => {
            console.log("[NostrConnect] WebSocket closed. Code:", event.code, "Reason:", event.reason);
            if (!isConnected) {
                // Don't call error if we're already connected or timed out
            }
        };
    } catch (err) {
        console.error("[NostrConnect] Failed to create WebSocket:", err);
        callbacks.onError("Failed to connect to relay.");
    }

    return cleanup;
}

// Send a signing request through Nostr Connect
export async function requestSignature(
    event: Omit<NostrEvent, "sig" | "id">,
    sessionData?: {
        clientPrivateKey: string;
        clientPubkey: string;
        remotePubkey: string;
        relay: string;
    }
): Promise<NostrEvent | null> {
    // Get session from storage if not provided
    const storedSession = sessionData || JSON.parse(
        sessionStorage.getItem("nostr_connect_session") || "null"
    );

    if (!storedSession) {
        throw new Error("No Nostr Connect session found");
    }

    return new Promise((resolve, reject) => {
        const ws = new WebSocket(storedSession.relay);
        const requestId = Math.random().toString(36).substring(2);
        let timeoutId: ReturnType<typeof setTimeout>;

        ws.onopen = async () => {
            // Subscribe to responses
            const subId = `sign-${Date.now()}`;
            ws.send(JSON.stringify(["REQ", subId, {
                kinds: [24133],
                "#p": [storedSession.clientPubkey],
                since: Math.floor(Date.now() / 1000) - 10,
            }]));

            // Send signing request
            const request = {
                id: requestId,
                method: "sign_event",
                params: [JSON.stringify(event)],
            };

            const encrypted = await nip04Encrypt(
                storedSession.clientPrivateKey,
                storedSession.remotePubkey,
                JSON.stringify(request)
            );

            const requestEvent: NostrEvent = {
                pubkey: storedSession.clientPubkey,
                created_at: Math.floor(Date.now() / 1000),
                kind: 24133,
                tags: [["p", storedSession.remotePubkey]],
                content: encrypted,
            };

            requestEvent.id = getEventHash(requestEvent);
            requestEvent.sig = await signEvent(requestEvent, storedSession.clientPrivateKey);

            ws.send(JSON.stringify(["EVENT", requestEvent]));

            // Set timeout
            timeoutId = setTimeout(() => {
                ws.close();
                reject(new Error("Signing request timed out"));
            }, 60000);
        };

        ws.onmessage = async (msg) => {
            try {
                const data = JSON.parse(msg.data);

                if (data[0] === "EVENT") {
                    const responseEvent: NostrEvent = data[2];

                    const decrypted = await nip04Decrypt(
                        storedSession.clientPrivateKey,
                        responseEvent.pubkey,
                        responseEvent.content
                    );

                    const response = JSON.parse(decrypted);

                    if (response.id === requestId) {
                        clearTimeout(timeoutId);
                        ws.close();

                        if (response.result) {
                            resolve(JSON.parse(response.result));
                        } else if (response.error) {
                            reject(new Error(response.error.message || "Signing rejected"));
                        }
                    }
                }
            } catch (err) {
                console.error("Error processing signature response:", err);
            }
        };

        ws.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error("Connection error"));
        };
    });
}

// Check if there's an active Nostr Connect session
export function hasNostrConnectSession(): boolean {
    return !!sessionStorage.getItem("nostr_connect_session");
}

// Clear Nostr Connect session
export function clearNostrConnectSession(): void {
    sessionStorage.removeItem("nostr_connect_session");
}
