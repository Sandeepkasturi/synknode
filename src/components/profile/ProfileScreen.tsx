import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import {
  LogOut, Shield, BellOff, Clock, UserX, Settings2, Flame
} from "lucide-react";
import { PauseAccountSheet } from "./PauseAccountSheet";
import { BlockedUsersScreen } from "./BlockedUsersScreen";
import { formatDistanceToNow } from "date-fns";

export const ProfileScreen: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { friends } = useFriends();
  const [pauseSheetOpen, setPauseSheetOpen] = useState(false);
  const [blockedSheetOpen, setBlockedSheetOpen] = useState(false);

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>
      </div>
    );
  }

  const isPaused = profile.pauseUntil && profile.pauseUntil > Date.now();

  const tiles = [
    { icon: Shield, label: "Privacy Settings", onClick: () => {} },
    { icon: Settings2, label: "Security", onClick: () => {} },
    { icon: UserX, label: "Blocked Users", onClick: () => setBlockedSheetOpen(true) },
    { icon: BellOff, label: "Mute Settings", onClick: () => {} },
    { icon: Clock, label: "Pause Account", onClick: () => setPauseSheetOpen(true), destructive: false },
    { icon: LogOut, label: "Sign Out", onClick: signOut, destructive: true },
  ];

  return (
    <div className="space-y-6 pb-4">
      <PauseAccountSheet open={pauseSheetOpen} onOpenChange={setPauseSheetOpen} />
      <BlockedUsersScreen open={blockedSheetOpen} onOpenChange={setBlockedSheetOpen} />

      {/* Paused banner */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center"
        >
          <p className="text-sm text-amber-400 font-medium">
            Account paused until{" "}
            {new Date(profile.pauseUntil!).toLocaleDateString()}. Only chat is available.
          </p>
        </motion.div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <Avatar className="w-24 h-24 border-2 border-primary/20">
          <AvatarImage src={user.photoURL ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
            {profile.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-foreground">
            @{profile.username}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
        </div>

        {/* Stats row */}
        <div className="flex gap-10 text-center">
          <div>
            <p className="text-xl font-bold font-display text-foreground">{friends.length}</p>
            <p className="text-xs text-muted-foreground">Friends</p>
          </div>
          <div>
            <p className="text-xl font-bold font-display text-foreground">{profile.totalShares}</p>
            <p className="text-xs text-muted-foreground">Shares</p>
          </div>
          {profile.shareStreak > 0 && (
            <div>
              <p className="text-xl font-bold text-amber-400 flex items-center gap-1">
                <Flame className="h-5 w-5" />
                {profile.shareStreak}
              </p>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
          )}
        </div>
      </div>

      {/* Peer ID section */}
      <div className="p-4 rounded-xl bg-secondary/20 border border-border/40">
        <p className="text-xs text-muted-foreground mb-1">Your Peer ID</p>
        <p className="text-xs font-mono text-primary break-all">{profile.peerId}</p>
      </div>

      {/* Action tiles */}
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <motion.button
            key={tile.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={tile.onClick}
            className={`flex flex-col items-start gap-3 p-4 rounded-xl border transition-colors text-left ${
              tile.destructive
                ? "bg-destructive/5 border-destructive/20 hover:bg-destructive/10"
                : "bg-secondary/20 border-border/40 hover:bg-secondary/40"
            }`}
          >
            <tile.icon
              className={`h-5 w-5 ${tile.destructive ? "text-destructive" : "text-muted-foreground"}`}
            />
            <span className={`text-sm font-medium ${tile.destructive ? "text-destructive" : "text-foreground"}`}>
              {tile.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
