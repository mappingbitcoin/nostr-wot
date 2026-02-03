import * as secp256k1 from "@noble/secp256k1";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

// Configure secp256k1 with sha256 (required in v3)
secp256k1.hashes.sha256 = sha256;
import * as nip44 from "nostr-tools/nip44";

// Generate a random 32-byte private key
export function generatePrivateKey(): string {
    const privateKey = secp256k1.utils.randomSecretKey();
    return bytesToHex(privateKey);
}

// Normalize private key - handles nsec format and ensures proper hex padding
export function normalizePrivateKey(privateKey: string): string {
    let hex = privateKey.trim();

    // If it's an nsec, convert to hex
    if (hex.startsWith("nsec")) {
        const decoded = bech32ToHex(hex);
        if (!decoded || decoded.type !== "nsec") {
            throw new Error("Invalid nsec format");
        }
        hex = decoded.hex;
    }

    // Ensure proper padding to 64 characters (32 bytes)
    if (hex.length < 64) {
        hex = hex.padStart(64, "0");
    }

    if (hex.length !== 64) {
        throw new Error(`Invalid private key length: expected 64 hex chars, got ${hex.length}`);
    }

    return hex;
}

// Derive public key from private key
export function getPublicKey(privateKey: string): string {
    const normalizedKey = normalizePrivateKey(privateKey);
    const pubkeyBytes = secp256k1.getPublicKey(hexToBytes(normalizedKey), true);
    // Remove the prefix byte (02 or 03) to get the x-coordinate only
    return bytesToHex(pubkeyBytes.slice(1));
}

// Convert hex to npub (bech32)
export function hexToNpub(hex: string): string {
    const ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    const hrp = "npub";

    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }

    // Convert 8-bit to 5-bit
    const values: number[] = [];
    let acc = 0;
    let bits = 0;
    for (const byte of bytes) {
        acc = (acc << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            bits -= 5;
            values.push((acc >> bits) & 0x1f);
        }
    }
    if (bits > 0) {
        values.push((acc << (5 - bits)) & 0x1f);
    }

    const polymod = (values: number[]): number => {
        const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
        let chk = 1;
        for (const v of values) {
            const b = chk >> 25;
            chk = ((chk & 0x1ffffff) << 5) ^ v;
            for (let i = 0; i < 5; i++) {
                if ((b >> i) & 1) chk ^= GEN[i];
            }
        }
        return chk;
    };

    const hrpExpand = (hrp: string): number[] => {
        const ret: number[] = [];
        for (const c of hrp) ret.push(c.charCodeAt(0) >> 5);
        ret.push(0);
        for (const c of hrp) ret.push(c.charCodeAt(0) & 31);
        return ret;
    };

    const createChecksum = (hrp: string, data: number[]): number[] => {
        const polymodValue = polymod([...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0]) ^ 1;
        const checksum: number[] = [];
        for (let i = 0; i < 6; i++) {
            checksum.push((polymodValue >> (5 * (5 - i))) & 31);
        }
        return checksum;
    };

    const checksum = createChecksum(hrp, values);
    const combined = [...values, ...checksum];

    return hrp + "1" + combined.map(v => ALPHABET[v]).join("");
}

// Decode bech32 (nsec/npub) to hex
export function bech32ToHex(bech32: string): { type: "nsec" | "npub"; hex: string } | null {
    try {
        const ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
        const lower = bech32.toLowerCase();
        const prefix = lower.startsWith("nsec") ? "nsec" : lower.startsWith("npub") ? "npub" : null;
        if (!prefix) return null;

        const data = lower.slice(prefix.length + 1);
        const values: number[] = [];
        for (const char of data) {
            const idx = ALPHABET.indexOf(char);
            if (idx === -1) return null;
            values.push(idx);
        }

        let acc = 0;
        let bits = 0;
        const bytes: number[] = [];
        for (const value of values.slice(0, -6)) {
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

// NIP-04 encryption (simplified - for NIP-46 communication)
export async function nip04Encrypt(
    privateKey: string,
    recipientPubkey: string,
    message: string
): Promise<string> {
    const normalizedKey = normalizePrivateKey(privateKey);
    const sharedPoint = secp256k1.getSharedSecret(hexToBytes(normalizedKey), hexToBytes("02" + recipientPubkey));
    const sharedX = sharedPoint.slice(1, 33);

    const iv = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey(
        "raw",
        sharedX,
        { name: "AES-CBC" },
        false,
        ["encrypt"]
    );

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        key,
        new TextEncoder().encode(message)
    );

    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    const ivBase64 = btoa(String.fromCharCode(...iv));

    return `${encryptedBase64}?iv=${ivBase64}`;
}

// NIP-44 decryption using nostr-tools (proven implementation)
function nip44DecryptMessage(
    privateKey: string,
    senderPubkey: string,
    ciphertext: string
): string {
    try {
    const normalizedKey = normalizePrivateKey(privateKey);
    const conversationKey = nip44.v2.utils.getConversationKey(
        hexToBytes(normalizedKey),
        senderPubkey
    );
    return nip44.v2.decrypt(ciphertext, conversationKey);
    } catch (e) {
        console.error('[nip44DecryptMessage]', e)
        throw e;
    }
}

// NIP-04 decryption (legacy format)
async function nip04DecryptOnly(
    privateKey: string,
    senderPubkey: string,
    ciphertext: string
): Promise<string> {
    // Check if crypto.subtle is available (not available in SSR or non-secure contexts)
    if (typeof crypto === "undefined" || !crypto.subtle) {
        throw new Error("WebCrypto not available in this context");
    }

    let encryptedBytes: Uint8Array | undefined;
    let ivBytes: Uint8Array | undefined;

    // Try different IV separator formats used by various signers
    if (ciphertext.includes("?iv=")) {
        const [encryptedBase64, ivBase64] = ciphertext.split("?iv=");
        encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
        ivBytes = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    } else if (ciphertext.includes("&iv=")) {
        const [encryptedBase64, ivBase64] = ciphertext.split("&iv=");
        encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
        ivBytes = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    } else if (ciphertext.includes("_iv=")) {
        const [encryptedBase64, ivBase64] = ciphertext.split("_iv=");
        encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
        ivBytes = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    } else {
        // Try to parse as JSON format: {"ciphertext": "...", "iv": "..."}
        try {
            const json = JSON.parse(ciphertext);
            if (json.ciphertext && json.iv) {
                encryptedBytes = Uint8Array.from(atob(json.ciphertext), c => c.charCodeAt(0));
                ivBytes = Uint8Array.from(atob(json.iv), c => c.charCodeAt(0));
            }
        } catch {
            // Not JSON, continue to next format
        }

        if (!encryptedBytes || !ivBytes) {
            throw new Error(`Invalid NIP-04 ciphertext format: no IV separator found`);
        }
    }

    if (!ivBytes || ivBytes.length !== 16) {
        throw new Error(`Invalid IV length: expected 16 bytes, got ${ivBytes?.length ?? 0} bytes`);
    }

    if (!encryptedBytes || encryptedBytes.length === 0) {
        throw new Error("Empty ciphertext");
    }

    const normalizedKey = normalizePrivateKey(privateKey);
    const sharedPoint = secp256k1.getSharedSecret(hexToBytes(normalizedKey), hexToBytes("02" + senderPubkey));
    const sharedX = sharedPoint.slice(1, 33);

    const key = await crypto.subtle.importKey(
        "raw",
        sharedX,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        // @ts-ignore
        { name: "AES-CBC", iv: ivBytes },
        key,
        encryptedBytes
    );

    return new TextDecoder().decode(decrypted);
}

// Unified decrypt function - detects NIP-44 vs NIP-04 format
export async function nip04Decrypt(
    privateKey: string,
    senderPubkey: string,
    ciphertext: string
): Promise<string> {
    // First, try to decode as base64 to check if it's NIP-44 format
    // NIP-44 is pure base64 without separators, so check this first
    try {
        const decoded = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
        // NIP-44 starts with version byte 0x02 and has minimum length:
        // 1 (version) + 32 (nonce) + 16 (min ciphertext) + 16 (poly1305 tag) = 65 bytes
        if (decoded[0] === 2 && decoded.length >= 65) {
            console.log("Detected NIP-44 format, decrypting with nostr-tools...");
            return nip44DecryptMessage(privateKey, senderPubkey, ciphertext);
        }
    } catch (e) {
        // Not valid base64 or decoding failed, try NIP-04
        console.log("Base64 decode failed or NIP-44 decrypt failed, trying NIP-04:", e);
    }

    // Check if this looks like NIP-04 format (has IV separator)
    if (ciphertext.includes("?iv=") || ciphertext.includes("&iv=") || ciphertext.includes("_iv=")) {
        console.log("Detected NIP-04 format with IV separator");
        return nip04DecryptOnly(privateKey, senderPubkey, ciphertext);
    }

    // Try to parse as JSON (NIP-04 variant)
    try {
        const json = JSON.parse(ciphertext);
        if (json.ciphertext && json.iv) {
            console.log("Detected NIP-04 JSON format");
            return nip04DecryptOnly(privateKey, senderPubkey, ciphertext);
        }
    } catch {
        // Not JSON
    }

    // Unknown format
    throw new Error(`Unknown encryption format. Content preview: ${ciphertext.substring(0, 50)}...`);
}

// Sign a Nostr event using Schnorr signatures (BIP-340)
export async function signEvent(event: NostrEvent, privateKey: string): Promise<string> {
    const normalizedKey = normalizePrivateKey(privateKey);
    const serialized = JSON.stringify([
        0,
        event.pubkey,
        event.created_at,
        event.kind,
        event.tags,
        event.content,
    ]);
    const hash = sha256(new TextEncoder().encode(serialized));
    // Nostr uses Schnorr signatures (BIP-340), not ECDSA
    const sig = await secp256k1.schnorr.sign(hash, hexToBytes(normalizedKey));
    return bytesToHex(sig);
}

// Calculate event ID
export function getEventHash(event: NostrEvent): string {
    const serialized = JSON.stringify([
        0,
        event.pubkey,
        event.created_at,
        event.kind,
        event.tags,
        event.content,
    ]);
    return bytesToHex(sha256(new TextEncoder().encode(serialized)));
}

export interface NostrEvent {
    id?: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: string[][];
    content: string;
    sig?: string;
}

// Generate a random secret for nostrconnect
export function generateSecret(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return bytesToHex(bytes);
}
