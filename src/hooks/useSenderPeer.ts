// ─── Sender Peer Hook ─────────────────────────────────────────────────────────
// PeerJS DataChannel transfer with E2E encryption and pre-flight security checks.

import { useState, useCallback } from "react";
import Peer from "peerjs";
import { toast } from "sonner";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/context/AuthContext";
import {
  encryptFile,
  computeFileHash,
  importPublicKey,
} from "@/hooks/useKeyManagement";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TransferProgress {
  active: boolean;
  progress: number;
  status: "idle" | "connecting" | "transferring" | "completed" | "error";
  currentFile?: string;
}

export class FriendshipRequiredError extends Error {
  constructor() {
    super("You must be friends to send files.");
    this.name = "FriendshipRequiredError";
  }
}

const CHUNK_SIZE = 64 * 1024; // 64KB chunks

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useSenderPeer = () => {
  const { user, profile, privateKey, peerId: myPeerId } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [transferProgress, setTransferProgress] = useState<TransferProgress>({
    active: false,
    progress: 0,
    status: "idle",
  });

  // ── Pre-flight security checks ─────────────────────────────────────────────
  const runPreflightChecks = useCallback(async (targetUid: string): Promise<void> => {
    if (!user || !profile) throw new Error("Not authenticated");

    // Check if sender account is paused
    if (profile.pauseUntil && profile.pauseUntil > Date.now()) {
      throw new Error("Your account is paused. File transfers are disabled.");
    }

    // Check friendship
    const q1 = query(
      collection(db, "friendships"),
      where("senderId", "==", user.uid),
      where("receiverId", "==", targetUid),
      where("status", "==", "accepted")
    );
    const q2 = query(
      collection(db, "friendships"),
      where("senderId", "==", targetUid),
      where("receiverId", "==", user.uid),
      where("status", "==", "accepted")
    );
    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    if (s1.empty && s2.empty) {
      throw new FriendshipRequiredError();
    }

    // Check blocks (either direction)
    const blockQ1 = query(
      collection(db, "blocks"),
      where("blockerId", "==", user.uid),
      where("blockedId", "==", targetUid)
    );
    const blockQ2 = query(
      collection(db, "blocks"),
      where("blockerId", "==", targetUid),
      where("blockedId", "==", user.uid)
    );
    const [b1, b2] = await Promise.all([getDocs(blockQ1), getDocs(blockQ2)]);
    if (!b1.empty || !b2.empty) {
      throw new Error("Transfer not allowed.");
    }

    // Check if recipient is paused
    const recipientSnap = await getDoc(doc(db, "users", targetUid));
    if (recipientSnap.exists()) {
      const recipientData = recipientSnap.data() as UserProfile;
      if (recipientData.pauseUntil && recipientData.pauseUntil > Date.now()) {
        throw new Error("Recipient's account is paused.");
      }
    }
  }, [user, profile]);

  // ── Main send function ─────────────────────────────────────────────────────
  const sendFiles = useCallback(async (
    files: File[],
    senderName: string,
    targetPeerId: string,
    targetUid?: string
  ): Promise<void> => {
    if (!user || !profile || !privateKey || !myPeerId) {
      toast.error("Please sign in to send files.");
      return;
    }
    if (!senderName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (files.length === 0) {
      toast.error("No files selected.");
      return;
    }

    // Run pre-flight checks if targetUid provided
    if (targetUid) {
      try {
        await runPreflightChecks(targetUid);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Transfer not allowed.");
        return;
      }
    }

    setIsConnected(true);
    setTransferProgress({ active: true, progress: 0, status: "connecting" });

    let peer: Peer | null = null;

    try {
      // Fetch recipient public key from Firestore (look up by peerId)
      let recipientPubKey: CryptoKey | null = null;
      if (targetUid) {
        const recipSnap = await getDoc(doc(db, "users", targetUid));
        if (recipSnap.exists()) {
          const recipData = recipSnap.data() as UserProfile;
          recipientPubKey = await importPublicKey(recipData.identityPublicKey);
        }
      }

      // Create PeerJS connection
      peer = new Peer(myPeerId + "_sender_" + Date.now());

      await new Promise<void>((resolve, reject) => {
        peer!.on("open", resolve);
        peer!.on("error", reject);
        setTimeout(() => reject(new Error("Peer connection timeout")), 10000);
      });

      const conn = peer.connect(targetPeerId, {
        reliable: true,
        metadata: { senderName: profile.username, senderUid: user.uid },
      });

      await new Promise<void>((resolve, reject) => {
        conn.on("open", resolve);
        conn.on("error", reject);
        setTimeout(() => reject(new Error("Connection timeout")), 10000);
      });

      setTransferProgress({ active: true, progress: 0, status: "transferring" });

      const totalFiles = files.length;
      let completedFiles = 0;

      for (const file of files) {
        setTransferProgress({
          active: true,
          progress: Math.round((completedFiles / totalFiles) * 100),
          status: "transferring",
          currentFile: `Encrypting: ${file.name}`,
        });

        // Compute plaintext hash BEFORE encryption
        const fileHash = await computeFileHash(file);

        // Encrypt file if we have the recipient's public key
        let fileData: ArrayBuffer;
        let encryptedKey: ArrayBuffer | null = null;
        let iv: Uint8Array | null = null;
        let isEncrypted = false;

        if (recipientPubKey && privateKey) {
          const encrypted = await encryptFile(file, recipientPubKey, privateKey);
          fileData = encrypted.encryptedData;
          encryptedKey = encrypted.encryptedKey;
          iv = encrypted.iv;
          isEncrypted = true;
        } else {
          fileData = await file.arrayBuffer();
        }

        // Send metadata header
        conn.send(JSON.stringify({
          type: "file_header",
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileHash,
          isEncrypted,
          encryptedKey: encryptedKey ? Array.from(new Uint8Array(encryptedKey)) : null,
          iv: iv ? Array.from(iv) : null,
          senderName,
          senderUid: user.uid,
        }));

        // Send file in chunks
        const totalChunks = Math.ceil(fileData.byteLength / CHUNK_SIZE);
        for (let i = 0; i < totalChunks; i++) {
          const chunk = fileData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          conn.send(chunk);

          const fileProgress = Math.round((i + 1) / totalChunks * 100);
          const overallProgress = Math.round(
            ((completedFiles + fileProgress / 100) / totalFiles) * 100
          );
          setTransferProgress({
            active: true,
            progress: overallProgress,
            status: "transferring",
            currentFile: `Sending: ${file.name} (${fileProgress}%)`,
          });

          // Small yield to prevent blocking
          if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));
        }

        // Signal end of file
        conn.send(JSON.stringify({ type: "file_end", fileName: file.name }));
        completedFiles++;
      }

      // Signal all files done
      conn.send(JSON.stringify({ type: "transfer_complete" }));

      setTransferProgress({ active: true, progress: 100, status: "completed" });
      toast.success(`${files.length} file(s) sent to ${targetPeerId.slice(0, 8)}…`);

      setTimeout(() => {
        conn.close();
        peer?.destroy();
        setTransferProgress({ active: false, progress: 0, status: "idle" });
        setIsConnected(false);
      }, 2000);
    } catch (error) {
      console.error("[useSenderPeer] Transfer error:", error);
      toast.error(error instanceof Error ? error.message : "Transfer failed.");
      setTransferProgress({ active: false, progress: 0, status: "error" });
      setIsConnected(false);
      peer?.destroy();
    }
  }, [user, profile, privateKey, myPeerId, runPreflightChecks]);

  return {
    isConnected,
    sendFiles,
    transferProgress,
  };
};
