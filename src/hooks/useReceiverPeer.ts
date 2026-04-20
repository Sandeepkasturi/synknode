// ─── Receiver Peer Hook ───────────────────────────────────────────────────────
// PeerJS receiver: uses user's peerId from Firestore, decrypts incoming files,
// verifies SHA-256, then adds to QueueContext.

import { useState, useCallback, useRef } from "react";
import Peer, { DataConnection } from "peerjs";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { useQueue } from "@/context/QueueContext";
import { decryptFile, computeFileHash, importPublicKey } from "@/hooks/useKeyManagement";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FileHeader {
  type: "file_header";
  fileName: string;
  fileSize: number;
  fileType: string;
  fileHash: string;
  isEncrypted: boolean;
  encryptedKey: number[] | null;
  iv: number[] | null;
  senderName: string;
  senderUid: string;
}

interface IncomingFile {
  header: FileHeader;
  chunks: ArrayBuffer[];
  bytesReceived: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useReceiverPeer = () => {
  const { user, profile, privateKey, peerId } = useAuth();
  const { addToQueue } = useQueue();
  const [isConnected, setIsConnected] = useState(false);
  const [isReceiver, setIsReceiver] = useState(false);
  const peerRef = useRef<Peer | null>(null);

  const startReceiver = useCallback(async () => {
    if (!user || !profile || !peerId) {
      toast.error("Please sign in to receive files.");
      return;
    }

    // Register PeerJS with user's permanent peerId from Firestore
    const peer = new Peer(peerId, {
      debug: 1,
    });

    peerRef.current = peer;

    peer.on("open", (id) => {
      console.log("[useReceiverPeer] Receiver ready with peerId:", id);
      setIsConnected(true);
      setIsReceiver(true);
      toast.success(`Receiver active — ID: ${id.slice(0, 8)}…`);
    });

    peer.on("error", (err) => {
      console.error("[useReceiverPeer] Peer error:", err);
      // ID taken — another session is open
      if ((err as any).type === "unavailable-id") {
        toast.error("Your receiver is already active in another tab.");
      } else {
        toast.error("Receiver error: " + err.message);
      }
    });

    peer.on("connection", (conn: DataConnection) => {
      handleIncomingConnection(conn);
    });
  }, [user, profile, privateKey, peerId, addToQueue]);

  // ── Handle incoming DataChannel connection ────────────────────────────────
  const handleIncomingConnection = useCallback(async (conn: DataConnection) => {
    const activeFiles: Map<string, IncomingFile> = new Map();
    let currentHeader: FileHeader | null = null;

    conn.on("open", () => {
      const senderName = conn.metadata?.senderName || "Unknown";
      toast.info(`📁 Incoming: ${senderName} is sending files…`);
    });

    conn.on("data", async (rawData: unknown) => {
      // Parse control messages (JSON strings)
      if (typeof rawData === "string") {
        const msg = JSON.parse(rawData) as { type: string } & any;

        if (msg.type === "file_header") {
          currentHeader = msg as FileHeader;
          activeFiles.set(msg.fileName, {
            header: currentHeader,
            chunks: [],
            bytesReceived: 0,
          });
        } else if (msg.type === "file_end") {
          // Reassemble and process
          const incoming = activeFiles.get(msg.fileName);
          if (!incoming) return;
          await finalizeFile(incoming);
          activeFiles.delete(msg.fileName);
          currentHeader = null;
        } else if (msg.type === "transfer_complete") {
          conn.close();
        }
        return;
      }

      // Binary chunk data
      if (rawData instanceof ArrayBuffer && currentHeader) {
        const incoming = activeFiles.get(currentHeader.fileName);
        if (incoming) {
          incoming.chunks.push(rawData);
          incoming.bytesReceived += rawData.byteLength;
        }
      }
    });

    conn.on("error", (err) => {
      console.error("[useReceiverPeer] Connection error:", err);
    });
  }, [addToQueue, privateKey]);

  // ── Finalize: decrypt + verify hash + add to queue ────────────────────────
  const finalizeFile = useCallback(async (incoming: IncomingFile) => {
    const { header, chunks } = incoming;

    // Reassemble chunks
    const totalBytes = chunks.reduce((sum, c) => sum + c.byteLength, 0);
    const combined = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }

    let finalBuffer: ArrayBuffer = combined.buffer;

    // Decrypt if encrypted
    if (header.isEncrypted && header.encryptedKey && header.iv && privateKey) {
      try {
        // Fetch sender public key for ECDH decryption
        let senderPubKey: CryptoKey | null = null;
        if (header.senderUid) {
          const senderSnap = await getDoc(doc(db, "users", header.senderUid));
          if (senderSnap.exists()) {
            const senderData = senderSnap.data() as UserProfile;
            senderPubKey = await importPublicKey(senderData.identityPublicKey);
          }
        }

        if (!senderPubKey) {
          toast.error(`Could not verify sender for ${header.fileName}`);
          return;
        }

        const encryptedKey = new Uint8Array(header.encryptedKey).buffer;
        const iv = new Uint8Array(header.iv);
        finalBuffer = await decryptFile(finalBuffer, encryptedKey, iv, privateKey, senderPubKey);
      } catch (err) {
        toast.error(`Decryption failed for ${header.fileName}`, { description: "File rejected." });
        return;
      }
    }

    // Verify SHA-256 hash
    const blob = new Blob([finalBuffer], { type: header.fileType });
    const receivedHash = await computeFileHash(blob);
    const hashVerified = receivedHash === header.fileHash;

    if (!hashVerified && header.fileHash) {
      toast.error(`File integrity check failed — ${header.fileName} may be corrupted.`, {
        description: "This file has been rejected for your safety.",
      });
      return;
    }

    if (!hashVerified && !header.fileHash) {
      toast.warning(`${header.fileName} — no integrity hash from sender.`);
    }

    // Add decrypted blob to queue
    addToQueue(header.senderName, [{
      name: header.fileName,
      size: header.fileSize,
      type: header.fileType,
      blob,
      fileHash: header.fileHash || null,
      hashVerified: header.fileHash ? hashVerified : null,
    }]);

    toast.success(`✅ Received: ${header.fileName}`);
  }, [privateKey, addToQueue]);

  const stopReceiver = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    setIsConnected(false);
    setIsReceiver(false);
    toast.info("Receiver stopped.");
  }, []);

  // receiverCode is now the user's permanent peerId (never static "SRGEC")
  const receiverCode = peerId ?? null;

  return {
    isConnected,
    isReceiver,
    startReceiver,
    stopReceiver,
    receiverCode,
  };
};
