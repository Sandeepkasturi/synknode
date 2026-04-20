// ─── Key Management Hook ─────────────────────────────────────────────────────
// All crypto operations use window.crypto.subtle only.
// Private keys NEVER leave this module — they are stored in IndexedDB via idb.

import { openDB } from "idb";

const DB_NAME = "synkdrop_keys";
const DB_VERSION = 1;
const KEY_STORE = "identity_keys";

async function getKeyDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(KEY_STORE)) {
        db.createObjectStore(KEY_STORE);
      }
    },
  });
}

/** Generate a new ECDH P-256 key pair for identity. */
export async function generateIdentityKeys(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
}

/** Export public key as base64-encoded JWK string (safe to store in Firestore). */
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const jwk = await window.crypto.subtle.exportKey("jwk", key);
  return btoa(JSON.stringify(jwk));
}

/** Import a base64 JWK public key back into a CryptoKey. */
export async function importPublicKey(base64: string): Promise<CryptoKey> {
  const jwk = JSON.parse(atob(base64));
  return window.crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

/** Store the private key in IndexedDB. Private key never goes to Firestore. */
export async function storePrivateKey(uid: string, key: CryptoKey): Promise<void> {
  const db = await getKeyDB();
  await db.put(KEY_STORE, key, `identity_private_key_${uid}`);
}

/** Load the private key from IndexedDB. Returns null if not found. */
export async function loadPrivateKey(uid: string): Promise<CryptoKey | null> {
  const db = await getKeyDB();
  const key = await db.get(KEY_STORE, `identity_private_key_${uid}`);
  return key ?? null;
}

/** ECDH key agreement — derive a shared AES-GCM key from two ECDH keys. */
export async function deriveSharedSecret(
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    { name: "ECDH", public: theirPublicKey },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Encrypt a file for a specific recipient using AES-256-GCM + ECDH key wrap. */
export async function encryptFile(
  file: File,
  recipientPublicKey: CryptoKey,
  myPrivateKey: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; encryptedKey: ArrayBuffer; iv: Uint8Array }> {
  const fileBuffer = await file.arrayBuffer();

  // Generate a fresh AES-GCM key for this file
  const fileKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // Encrypt the file
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    fileKey,
    fileBuffer
  );

  // Wrap the file key using ECDH shared secret
  const sharedKey = await deriveSharedSecret(myPrivateKey, recipientPublicKey);
  const exportedFileKey = await window.crypto.subtle.exportKey("raw", fileKey);
  const keyIv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: keyIv },
    sharedKey,
    exportedFileKey
  );

  // Prepend keyIv to encryptedKey so receiver can unwrap
  const combined = new Uint8Array(12 + encryptedKey.byteLength);
  combined.set(keyIv, 0);
  combined.set(new Uint8Array(encryptedKey), 12);

  return { encryptedData, encryptedKey: combined.buffer, iv };
}

/** Decrypt a file using the receiver's private key. */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  encryptedKeyWithIv: ArrayBuffer,
  iv: Uint8Array,
  myPrivateKey: CryptoKey,
  senderPublicKey: CryptoKey
): Promise<ArrayBuffer> {
  const sharedKey = await deriveSharedSecret(myPrivateKey, senderPublicKey);

  const keyBytes = new Uint8Array(encryptedKeyWithIv);
  const keyIv = keyBytes.slice(0, 12);
  const encryptedKey = keyBytes.slice(12);

  const rawFileKey = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: keyIv },
    sharedKey,
    encryptedKey
  );

  const fileKey = await window.crypto.subtle.importKey(
    "raw",
    rawFileKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  return window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, fileKey, encryptedData);
}

/** Compute SHA-256 hash of a file as a hex string. */
export async function computeFileHash(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Store non-friend message count in IndexedDB for rate limiting. */
export async function getNonFriendMessageCount(recipientUid: string): Promise<number> {
  const db = await getKeyDB();
  const hour = new Date().toISOString().slice(0, 13);
  const key = `nonFriendMessages_${recipientUid}_${hour}`;
  const count = await db.get(KEY_STORE, key);
  return count ?? 0;
}

/** Increment non-friend message count. */
export async function incrementNonFriendMessageCount(recipientUid: string): Promise<number> {
  const db = await getKeyDB();
  const hour = new Date().toISOString().slice(0, 13);
  const key = `nonFriendMessages_${recipientUid}_${hour}`;
  const current = (await db.get(KEY_STORE, key)) ?? 0;
  const next = current + 1;
  await db.put(KEY_STORE, next, key);
  return next;
}

/** Store orientation permission status. */
export async function storeOrientationPermission(granted: boolean): Promise<void> {
  const db = await getKeyDB();
  await db.put(KEY_STORE, granted, "orientation_permission");
}

/** Load orientation permission status. */
export async function loadOrientationPermission(): Promise<boolean | null> {
  const db = await getKeyDB();
  const val = await db.get(KEY_STORE, "orientation_permission");
  return val ?? null;
}

export function useKeyManagement() {
  return {
    generateIdentityKeys,
    exportPublicKey,
    importPublicKey,
    storePrivateKey,
    loadPrivateKey,
    deriveSharedSecret,
    encryptFile,
    decryptFile,
    computeFileHash,
  };
}
