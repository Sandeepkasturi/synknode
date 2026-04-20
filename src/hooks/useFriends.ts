// ─── Friends Hook ─────────────────────────────────────────────────────────────
// Manages social graph: friendships, follow graph, online presence via Firebase RTDB

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, onValue, set, onDisconnect } from "firebase/database";
import { db, rtdb } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FriendRequest {
  id: string;
  senderId: string;
  senderProfile: UserProfile | null;
  createdAt: number;
}

export type FriendWithPresence = UserProfile & {
  online: boolean;
  lastSeen: number | null;
  friendshipId: string;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFriends() {
  const { user, profile } = useAuth();
  const [friends, setFriends] = useState<FriendWithPresence[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const presenceUnsubs = useRef<Record<string, () => void>>({});

  // ── Online presence for current user ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const presRef = ref(rtdb, `presence/${user.uid}`);
    set(presRef, { online: true, lastSeen: Date.now() });
    onDisconnect(presRef).set({ online: false, lastSeen: Date.now() });

    return () => {
      set(presRef, { online: false, lastSeen: Date.now() });
    };
  }, [user]);

  // ── Load friend online presence ────────────────────────────────────────────
  const subscribePresence = useCallback((uid: string, callback: (online: boolean, lastSeen: number | null) => void) => {
    const presRef = ref(rtdb, `presence/${uid}`);
    const unsubscribe = onValue(presRef, (snapshot) => {
      const data = snapshot.val();
      callback(data?.online ?? false, data?.lastSeen ?? null);
    });
    return () => unsubscribe();
  }, []);

  // ── Friendships realtime listener ──────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setFriends([]);
      setPendingRequests([]);
      return;
    }

    // Listen for accepted friendships where current user is sender or receiver
    const q1 = query(
      collection(db, "friendships"),
      where("senderId", "==", user.uid),
      where("status", "==", "accepted")
    );
    const q2 = query(
      collection(db, "friendships"),
      where("receiverId", "==", user.uid),
      where("status", "==", "accepted")
    );
    // Pending incoming requests
    const qPending = query(
      collection(db, "friendships"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending")
    );

    const loadFriendProfiles = async (
      docs: Array<{ id: string; data: { senderId: string; receiverId: string } }>
    ) => {
      const result: FriendWithPresence[] = [];

      for (const d of docs) {
        const friendUid = d.data.senderId === user.uid ? d.data.receiverId : d.data.senderId;
        const snap = await getDoc(doc(db, "users", friendUid));
        if (!snap.exists()) continue;
        const prof = snap.data() as UserProfile;

        result.push({
          ...prof,
          online: false,
          lastSeen: null,
          friendshipId: d.id,
        });
      }

      return result;
    };

    let friendsFromQ1: Array<{ id: string; data: any }> = [];
    let friendsFromQ2: Array<{ id: string; data: any }> = [];

    const mergeFriends = async () => {
      const combined = [...friendsFromQ1, ...friendsFromQ2];
      const profiles = await loadFriendProfiles(combined);

      // Subscribe to presence for each friend
      Object.values(presenceUnsubs.current).forEach((u) => u());
      presenceUnsubs.current = {};

      const withPresence = [...profiles];
      setFriends(withPresence);

      profiles.forEach((f, i) => {
        const unsub = subscribePresence(f.uid, (online, lastSeen) => {
          setFriends((prev) =>
            prev.map((fr) => fr.uid === f.uid ? { ...fr, online, lastSeen } : fr)
          );
        });
        presenceUnsubs.current[f.uid] = unsub;
      });
    };

    const unsub1 = onSnapshot(q1, (snap) => {
      friendsFromQ1 = snap.docs.map((d) => ({ id: d.id, data: d.data() as any }));
      mergeFriends();
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      friendsFromQ2 = snap.docs.map((d) => ({ id: d.id, data: d.data() as any }));
      mergeFriends();
    });

    const unsubPending = onSnapshot(qPending, async (snap) => {
      const requests: FriendRequest[] = [];
      for (const d of snap.docs) {
        const data = d.data();
        const senderSnap = await getDoc(doc(db, "users", data.senderId));
        requests.push({
          id: d.id,
          senderId: data.senderId,
          senderProfile: senderSnap.exists() ? (senderSnap.data() as UserProfile) : null,
          createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
        });
      }
      setPendingRequests(requests);
    });

    return () => {
      unsub1();
      unsub2();
      unsubPending();
      Object.values(presenceUnsubs.current).forEach((u) => u());
    };
  }, [user, subscribePresence]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const sendFriendRequest = useCallback(async (targetUid: string) => {
    if (!user) return;
    if (targetUid === user.uid) {
      toast.error("You can't friend yourself");
      return;
    }

    // Check if friendship already exists
    const q = query(
      collection(db, "friendships"),
      where("senderId", "==", user.uid),
      where("receiverId", "==", targetUid)
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      toast.info("Friend request already sent");
      return;
    }

    await addDoc(collection(db, "friendships"), {
      senderId: user.uid,
      receiverId: targetUid,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    toast.success("Friend request sent!");
  }, [user]);

  const acceptRequest = useCallback(async (friendshipId: string) => {
    await updateDoc(doc(db, "friendships", friendshipId), {
      status: "accepted",
      updatedAt: serverTimestamp(),
    });
    toast.success("Friend request accepted!");
  }, []);

  const declineRequest = useCallback(async (friendshipId: string) => {
    await deleteDoc(doc(db, "friendships", friendshipId));
    toast.info("Friend request declined");
  }, []);

  const removeFriend = useCallback(async (targetUid: string) => {
    if (!user) return;
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
    const toDelete = [...s1.docs, ...s2.docs];
    await Promise.all(toDelete.map((d) => deleteDoc(d.ref)));
    toast.info("Friend removed");
  }, [user]);

  const isFriend = useCallback((targetUid: string): boolean => {
    return friends.some((f) => f.uid === targetUid);
  }, [friends]);

  return {
    friends,
    pendingRequests,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    isFriend,
  };
}
