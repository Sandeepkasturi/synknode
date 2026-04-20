import React, { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { useFriends, FriendWithPresence } from "@/hooks/useFriends";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, UserPlus, Check, X, MoreVertical,
  Send, MessageCircle, Phone, UserX
} from "lucide-react";
import { UserProfileSheet } from "./UserProfileSheet";
import { ComingSoonOverlay } from "@/components/ui/ComingSoonOverlay";
import { toast } from "sonner";

type FilterChip = "all" | "online" | "pending";

export const FriendsTab: React.FC<{ onChat?: (uid: string) => void; onCall?: (uid: string) => void }> = ({
  onChat,
  onCall,
}) => {
  const { user } = useAuth();
  const { friends, pendingRequests, sendFriendRequest, acceptRequest, declineRequest, removeFriend } = useFriends();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState<FilterChip>("all");
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // ── Debounced search ───────────────────────────────────────────────────────
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("username", ">=", searchQuery.toLowerCase()),
          where("username", "<=", searchQuery.toLowerCase() + "\uf8ff")
        );
        const snap = await getDocs(q);
        const results: UserProfile[] = [];
        snap.forEach((d) => {
          const data = d.data() as UserProfile;
          if (data.uid !== user?.uid) {
            results.push(data);
          }
        });
        setSearchResults(results.slice(0, 10));
      } catch (err) {
        console.error("[FriendsTab] Search error:", err);
      }
    }, 400);

    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [searchQuery, user]);

  const filteredFriends = friends.filter((f) => {
    if (filter === "online") return f.online;
    return true;
  });

  const openProfile = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setProfileSheetOpen(true);
  };

  const formatLastSeen = (ts: number | null) => {
    if (!ts) return "Unknown";
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="space-y-4 pb-4">
      <UserProfileSheet
        profile={selectedProfile}
        open={profileSheetOpen}
        onOpenChange={setProfileSheetOpen}
        onChat={onChat}
        onCall={undefined}
      />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Find friends by username…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary/40 border-border focus:border-primary"
        />
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-border/50 bg-card overflow-hidden"
          >
            <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Search results</p>
            {searchResults.map((result) => {
              const alreadyFriend = friends.some((f) => f.uid === result.uid);
              return (
                <div
                  key={result.uid}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => openProfile(result)}
                >
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={result.photoURL ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {result.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">@{result.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.displayName}</p>
                  </div>
                  {!alreadyFriend && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); sendFriendRequest(result.uid); }}
                      className="text-xs border-primary/30 text-primary hover:bg-primary/10 flex-shrink-0"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
                  {alreadyFriend && (
                    <Badge variant="secondary" className="text-[10px] text-[#00D68F] border-[#00D68F]/30">
                      Friend
                    </Badge>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Requests ({pendingRequests.length})
          </p>
          {pendingRequests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50"
            >
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={req.senderProfile?.photoURL ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {req.senderProfile?.username?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  @{req.senderProfile?.username ?? "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">Wants to be friends</p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={() => acceptRequest(req.id)}
                  className="h-8 w-8 p-0 bg-[#00D68F]/10 text-[#00D68F] hover:bg-[#00D68F]/20 border border-[#00D68F]/30"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => declineRequest(req.id)}
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2">
        {(["all", "online", "pending"] as FilterChip[]).map((chip) => (
          <button
            key={chip}
            onClick={() => setFilter(chip)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              filter === chip
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/40 text-muted-foreground border-border/50 hover:border-primary/30"
            }`}
          >
            {chip === "all" ? `All (${friends.length})`
              : chip === "online" ? `Online (${friends.filter((f) => f.online).length})`
                : `Pending (${pendingRequests.length})`}
          </button>
        ))}
      </div>

      {/* Friend List */}
      {filteredFriends.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-full bg-secondary/40 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No friends yet</p>
          <p className="text-xs text-muted-foreground">Search for users above to send friend requests.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFriends.map((friend) => (
            <motion.div
              key={friend.uid}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border/40 hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => openProfile(friend)}
            >
              {/* Avatar with online dot */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-11 h-11">
                  <AvatarImage src={friend.photoURL ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {friend.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                  friend.online ? "bg-[#00D68F]" : "bg-muted-foreground/40"
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">@{friend.username}</p>
                <p className="text-xs text-muted-foreground">
                  {friend.online ? "Online now" : `Last seen ${formatLastSeen(friend.lastSeen)}`}
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onChat?.(friend.uid)}
                  className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                  title="Chat"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <ComingSoonOverlay feature="Audio calling">
                  <button
                    className="p-1.5 rounded-lg text-muted-foreground"
                    title="Call — Coming Soon"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                </ComingSoonOverlay>

                {/* Context menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 hover:bg-secondary/60 rounded-lg transition-colors text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border/50">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => removeFriend(friend.uid)}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Remove Friend
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
