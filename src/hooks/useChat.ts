// ─── Chat Hook ────────────────────────────────────────────────────────────────
// E2E encrypted chat via Firestore. ECDH shared secrets cached in-memory.

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/context/AuthContext";
import {
  importPublicKey,
  deriveSharedSecret,
  getNonFriendMessageCount,
  incrementNonFriendMessageCount,
} from "@/hooks/useKeyManagement";
import { useFriends } from "@/hooks/useFriends";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  plaintext: string;        // decrypted in-memory only
  encryptedContent: string; // what's in Firestore
  iv: string;
  sentAt: number;
  deliveredAt: number | null;
  readAt: number | null;
  messageType: "text" | "file_share_notification";
}

export interface Conversation {
  id: string;
  participantUid: string;
  participantProfile: UserProfile | null;
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: number;
}

function conversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

// ─── AES-GCM encrypt/decrypt with a CryptoKey ────────────────────────────────
async function encryptText(text: string, key: CryptoKey): Promise<{ ct: string; iv: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ct = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(text));
  const toB64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  return { ct: toB64(ct), iv: btoa(String.fromCharCode(...iv)) };
}

async function decryptText(ct: string, iv: string, key: CryptoKey): Promise<string> {
  const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const plain = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(iv) },
    key,
    fromB64(ct)
  );
  return new TextDecoder().decode(plain);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useChat() {
  const { user, profile, privateKey } = useAuth();
  const { isFriend } = useFriends();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationUid, setActiveConversationUid] = useState<string | null>(null);

  // Cache derived shared secrets (uid → CryptoKey)
  const secretCache = useRef<Map<string, CryptoKey>>(new Map());

  // ── Derive shared secret for a given UID ─────────────────────────────────
  const getSharedSecret = useCallback(async (theirUid: string): Promise<CryptoKey | null> => {
    if (!privateKey) return null;
    if (secretCache.current.has(theirUid)) return secretCache.current.get(theirUid)!;

    try {
      const snap = await getDoc(doc(db, "users", theirUid));
      if (!snap.exists()) return null;
      const theirPubKeyB64 = (snap.data() as UserProfile).identityPublicKey;
      const theirPubKey = await importPublicKey(theirPubKeyB64);
      const secret = await deriveSharedSecret(privateKey, theirPubKey);
      secretCache.current.set(theirUid, secret);
      return secret;
    } catch {
      return null;
    }
  }, [privateKey]);

  // ── Load conversations ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const convs: Conversation[] = [];
      for (const d of snap.docs) {
        const data = d.data();
        const participantUid = (data.participants as string[]).find((p) => p !== user.uid);
        if (!participantUid) continue;

        const profSnap = await getDoc(doc(db, "users", participantUid));
        convs.push({
          id: d.id,
          participantUid,
          participantProfile: profSnap.exists() ? (profSnap.data() as UserProfile) : null,
          lastMessage: data.lastMessage || "",
          lastMessageAt: (data.lastMessageAt as Timestamp)?.toMillis?.() ?? 0,
          unreadCount: data.unreadCount?.[user.uid] ?? 0,
        });
      }
      setConversations(convs);
    });

    return unsub;
  }, [user]);

  // ── Load messages for active conversation ──────────────────────────────────
  useEffect(() => {
    if (!user || !activeConversationUid || !privateKey) {
      setMessages([]);
      return;
    }

    const convId = conversationId(user.uid, activeConversationUid);
    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", convId),
      orderBy("sentAt", "asc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const secret = await getSharedSecret(activeConversationUid);
      if (!secret) return;

      const decrypted: Message[] = [];
      for (const d of snap.docs) {
        const data = d.data();
        try {
          const plain = await decryptText(data.encryptedContent, data.iv, secret);
          decrypted.push({
            id: d.id,
            senderId: data.senderId,
            recipientId: data.recipientId,
            plaintext: plain,
            encryptedContent: data.encryptedContent,
            iv: data.iv,
            sentAt: (data.sentAt as Timestamp)?.toMillis?.() ?? Date.now(),
            deliveredAt: (data.deliveredAt as Timestamp)?.toMillis?.() ?? null,
            readAt: (data.readAt as Timestamp)?.toMillis?.() ?? null,
            messageType: data.messageType || "text",
          });
        } catch {
          // Decryption failed - skip
        }
      }
      setMessages(decrypted);
    });

    return unsub;
  }, [user, activeConversationUid, privateKey, getSharedSecret]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (recipientUid: string, plaintext: string) => {
    if (!user || !profile || !privateKey) return;

    // Rate limiting for non-friends
    if (!isFriend(recipientUid)) {
      const count = await getNonFriendMessageCount(recipientUid);
      if (count >= 5) {
        toast.error("Send a friend request to continue this conversation.");
        return;
      }
      await incrementNonFriendMessageCount(recipientUid);
    }

    const secret = await getSharedSecret(recipientUid);
    if (!secret) {
      toast.error("Cannot encrypt message — recipient key not found.");
      return;
    }

    const { ct, iv } = await encryptText(plaintext, secret);
    const convId = conversationId(user.uid, recipientUid);

    await addDoc(collection(db, "messages"), {
      conversationId: convId,
      senderId: user.uid,
      recipientId: recipientUid,
      encryptedContent: ct,
      iv,
      messageType: "text",
      sentAt: serverTimestamp(),
      deliveredAt: null,
      readAt: null,
    });

    // Update conversation doc
    await setDoc(doc(db, "conversations", convId), {
      participants: [user.uid, recipientUid],
      lastMessage: plaintext.slice(0, 40) + (plaintext.length > 40 ? "…" : ""),
      lastMessageAt: serverTimestamp(),
      [`unreadCount.${recipientUid}`]: (conversations.find((c) => c.id === convId)?.unreadCount ?? 0) + 1,
    }, { merge: true });
  }, [user, profile, privateKey, isFriend, getSharedSecret, conversations]);

  const markRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    await updateDoc(doc(db, "conversations", conversationId), {
      [`unreadCount.${user.uid}`]: 0,
    });
  }, [user]);

  const openConversation = useCallback((uid: string) => {
    setActiveConversationUid(uid);
    setMessages([]);
  }, []);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    conversations,
    messages,
    activeConversationUid,
    totalUnread,
    sendMessage,
    markRead,
    openConversation,
  };
}
