import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { toast } from "sonner";
import {
  generateIdentityKeys,
  exportPublicKey,
  storePrivateKey,
  loadPrivateKey,
} from "@/hooks/useKeyManagement";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  peerId: string;
  identityPublicKey: string;
  totalShares: number;
  shareStreak: number;
  createdAt: number;
  pauseUntil?: number | null;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isPrimaryAdmin: boolean;
  peerId: string | null;
  identityPublicKey: string | null;
  privateKey: CryptoKey | null;
  isNewUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ─── Primary Admin UIDs (kept for backward compat) ───────────────────────────
const PRIMARY_ADMIN_UIDS = (
  import.meta.env.VITE_PRIMARY_ADMIN_UIDS || ""
).split(",").filter(Boolean);

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // ── Load or create Firestore profile ──────────────────────────────────────
  const loadOrCreateProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        // Existing user — load from Firestore
        const data = snap.data() as UserProfile;
        setIsNewUser(false);

        // Load private key from IndexedDB
        const privKey = await loadPrivateKey(firebaseUser.uid);
        if (privKey) {
          setPrivateKey(privKey);
        } else {
          // Key missing from IndexedDB (e.g. new device) — regenerate but keep same pubkey slot
          const pair = await generateIdentityKeys();
          await storePrivateKey(firebaseUser.uid, pair.privateKey);
          setPrivateKey(pair.privateKey);
        }

        return data;
      } else {
        // New user — create profile + generate keys
        const peerId = crypto.randomUUID();
        const keyPair = await generateIdentityKeys();
        const pubKeyB64 = await exportPublicKey(keyPair.publicKey);

        // Store private key in IndexedDB — never in Firestore
        await storePrivateKey(firebaseUser.uid, keyPair.privateKey);
        setPrivateKey(keyPair.privateKey);

        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          username: (firebaseUser.displayName || "user" + Math.floor(Math.random() * 9999))
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, ""),
          displayName: firebaseUser.displayName || "SynkDrop User",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL,
          peerId,
          identityPublicKey: pubKeyB64,
          totalShares: 0,
          shareStreak: 0,
          createdAt: Date.now(),
          pauseUntil: null,
        };

        await setDoc(userRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
        });

        setIsNewUser(true);
        return newProfile;
      }
    } catch (error) {
      console.error("[AuthContext] loadOrCreateProfile error:", error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
  }, [user]);

  // ── Firebase Auth listener ─────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const prof = await loadOrCreateProfile(firebaseUser);
        setProfile(prof);
      } else {
        setProfile(null);
        setPrivateKey(null);
        setIsNewUser(false);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, [loadOrCreateProfile]);

  // ── Sign in with Google ────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Profile is loaded via onAuthStateChanged above
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        console.error("[AuthContext] Sign in error:", error);
        toast.error("Sign in failed. Please try again.");
      }
    }
  }, []);

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
      setPrivateKey(null);
      setIsNewUser(false);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("[AuthContext] Sign out error:", error);
      toast.error("Error signing out");
    }
  }, []);

  const isPrimaryAdmin = user ? PRIMARY_ADMIN_UIDS.includes(user.uid) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isPrimaryAdmin,
        peerId: profile?.peerId ?? null,
        identityPublicKey: profile?.identityPublicKey ?? null,
        privateKey,
        isNewUser,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
