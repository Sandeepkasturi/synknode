import React, { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { useFriends, FriendWithPresence } from "@/hooks/useFriends";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Check, X, MessageCircle, Phone, Wifi, WifiOff } from "lucide-react";
import { UserProfileSheet } from "./UserProfileSheet";
import { ComingSoonOverlay } from "@/components/ui/ComingSoonOverlay";
import { toast } from "sonner";

type FilterTab = "friends" | "discover" | "requests";

export const FriendsTab: React.FC<{ onChat?: (uid: string) => void }> = ({ onChat }) => {
  const { user } = useAuth();
  const { friends, pendingRequests, sendFriendRequest, acceptRequest, declineRequest } = useFriends();
  const [tab, setTab] = useState<FilterTab>("friends");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!search.trim() || search.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const q = query(
          collection(db, "users"),
          where("username", ">=", search.toLowerCase()),
          where("username", "<=", search.toLowerCase() + "\uf8ff")
        );
        const snap = await getDocs(q);
        setSearchResults(snap.docs.map(d => d.data() as UserProfile).filter(u => u.uid !== user?.uid));
      } catch { /* ignore */ }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [search, user]);

  const formatLastSeen = (ts: number | null) => {
    if (!ts) return "Offline";
    const d = Date.now() - ts;
    if (d < 60000) return "Active now";
    if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
    if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
    return `${Math.floor(d / 86400000)}d ago`;
  };

  const TABS: { id: FilterTab; label: string; count?: number }[] = [
    { id: "friends",  label: "Friends",  count: friends.length },
    { id: "discover", label: "Discover" },
    { id: "requests", label: "Requests", count: pendingRequests.length },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: "#06060F" }}>
      <UserProfileSheet
        profile={selectedProfile}
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onChat={onChat}
        onCall={undefined}
      />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-14 pb-4">
        <motion.h1
          className="font-display font-bold text-3xl text-foreground tracking-tight mb-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          People
        </motion.h1>
        <p className="text-sm text-muted-foreground">Your trusted circle</p>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────── */}
      <div className="px-5 mb-4">
        <motion.div
          className="relative rounded-2xl input-ring transition-all"
          style={{
            background: "rgba(18,18,36,0.8)",
            border: "1px solid rgba(255,255,255,0.07)"
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setTab("discover"); }}
            placeholder="Search by username…"
            className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          {searching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          )}
        </motion.div>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────── */}
      <div className="flex gap-1 px-5 mb-5">
        {TABS.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
            style={{
              color: tab === id ? "#00E5C8" : "rgba(255,255,255,0.35)",
              background: tab === id ? "rgba(0,229,200,0.08)" : "transparent",
              border: tab === id ? "1px solid rgba(0,229,200,0.2)" : "1px solid transparent",
            }}
          >
            {label}
            {count != null && count > 0 && (
              <span
                className="text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1"
                style={{
                  background: id === "requests" ? "rgba(255,180,71,0.15)" : "rgba(0,229,200,0.15)",
                  color: id === "requests" ? "#FFB347" : "#00E5C8",
                }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
        <AnimatePresence mode="wait">

          {/* Friends list */}
          {tab === "friends" && (
            <motion.div key="friends" className="space-y-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {friends.length === 0 ? (
                <EmptyState
                  icon="👥"
                  title="No friends yet"
                  subtitle="Search for people by username to connect"
                />
              ) : (
                friends.map((f, i) => (
                  <FriendCard
                    key={f.uid}
                    friend={f}
                    index={i}
                    formatLastSeen={formatLastSeen}
                    onChat={() => { onChat?.(f.uid); }}
                    onProfile={() => { setSelectedProfile(f); setProfileOpen(true); }}
                  />
                ))
              )}
            </motion.div>
          )}

          {/* Discover / search */}
          {tab === "discover" && (
            <motion.div key="discover" className="space-y-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {searchResults.length === 0 && !searching && (
                <EmptyState
                  icon="🔍"
                  title={search.length < 2 ? "Find people" : "No results"}
                  subtitle={search.length < 2 ? "Type at least 2 characters to search" : `No users matching "${search}"`}
                />
              )}
              {searchResults.map((u, i) => (
                <motion.div
                  key={u.uid}
                  className="flex items-center gap-3 p-3.5 rounded-2xl"
                  style={{ background: "rgba(18,18,36,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Avatar className="w-11 h-11 flex-shrink-0" style={{ boxShadow: "0 0 0 1.5px rgba(255,255,255,0.1)" }}>
                    <AvatarImage src={u.photoURL ?? undefined} />
                    <AvatarFallback style={{ background: "rgba(0,229,200,0.1)", color: "#00E5C8", fontFamily: "Outfit" }}>
                      {u.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">@{u.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.displayName}</p>
                  </div>
                  <motion.button
                    onClick={() => sendFriendRequest(u.uid)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(0,229,200,0.1)", color: "#00E5C8", border: "1px solid rgba(0,229,200,0.2)" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pending requests */}
          {tab === "requests" && (
            <motion.div key="requests" className="space-y-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {pendingRequests.length === 0 ? (
                <EmptyState icon="📬" title="No pending requests" subtitle="Friend requests will appear here" />
              ) : (
                pendingRequests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    className="flex items-center gap-3 p-3.5 rounded-2xl"
                    style={{
                      background: "rgba(255,179,71,0.04)",
                      border: "1px solid rgba(255,179,71,0.12)"
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Avatar className="w-11 h-11 flex-shrink-0">
                      <AvatarImage src={req.senderProfile?.photoURL ?? undefined} />
                      <AvatarFallback style={{ background: "rgba(255,179,71,0.1)", color: "#FFB347", fontFamily: "Outfit" }}>
                        {req.senderProfile?.username[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">@{req.senderProfile?.username ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">Wants to connect</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => acceptRequest(req.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(0,229,200,0.12)", border: "1px solid rgba(0,229,200,0.25)" }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Check className="w-4 h-4 text-primary" />
                      </motion.button>
                      <motion.button
                        onClick={() => declineRequest(req.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(255,75,106,0.08)", border: "1px solid rgba(255,75,106,0.15)" }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

const FriendCard: React.FC<{
  friend: FriendWithPresence;
  index: number;
  formatLastSeen: (ts: number | null) => string;
  onChat: () => void;
  onProfile: () => void;
}> = ({ friend, index, formatLastSeen, onChat, onProfile }) => (
  <motion.div
    className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer group"
    style={{ background: "rgba(18,18,36,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ background: "rgba(18,18,36,0.8)", borderColor: "rgba(255,255,255,0.1)" }}
    onClick={onProfile}
  >
    {/* Avatar + presence */}
    <div className="relative flex-shrink-0">
      <Avatar
        className="w-12 h-12"
        style={{ boxShadow: friend.online ? "0 0 0 2px #06060F, 0 0 0 3.5px #00E5C8" : "0 0 0 2px #06060F, 0 0 0 3.5px rgba(255,255,255,0.08)" }}
      >
        <AvatarImage src={friend.photoURL ?? undefined} />
        <AvatarFallback style={{ background: "rgba(0,229,200,0.08)", color: "#00E5C8", fontFamily: "Outfit", fontWeight: 700 }}>
          {friend.username[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {/* Presence dot */}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
        style={{
          background:   friend.online ? "#00E5C8" : "rgba(255,255,255,0.15)",
          borderColor:  "#06060F",
          boxShadow:    friend.online ? "0 0 6px rgba(0,229,200,0.6)" : "none",
        }}
      />
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="text-[14px] font-semibold text-foreground leading-none mb-1">@{friend.username}</p>
      <p className="text-[11px] flex items-center gap-1"
        style={{ color: friend.online ? "#00E5C8" : "rgba(255,255,255,0.3)" }}>
        {friend.online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {friend.online ? "Online" : formatLastSeen(friend.lastSeen)}
      </p>
    </div>

    {/* Actions */}
    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <motion.button
        onClick={e => { e.stopPropagation(); onChat(); }}
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(0,229,200,0.1)", border: "1px solid rgba(0,229,200,0.2)" }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-3.5 h-3.5 text-primary" />
      </motion.button>
      <ComingSoonOverlay feature="Audio calling">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,179,71,0.08)", border: "1px solid rgba(255,179,71,0.15)" }}>
          <Phone className="w-3.5 h-3.5" style={{ color: "#FFB347" }} />
        </div>
      </ComingSoonOverlay>
    </div>
  </motion.div>
);

const EmptyState: React.FC<{ icon: string; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-16 text-center"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <p className="text-[15px] font-semibold text-foreground mb-1">{title}</p>
    <p className="text-[13px] text-muted-foreground max-w-[200px] leading-relaxed">{subtitle}</p>
  </motion.div>
);
