import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import {
  LogOut, Shield, Lock, UserX, Clock, ChevronRight,
  Flame, Copy, Check, Bell, Eye, EyeOff, Key, Fingerprint
} from "lucide-react";
import { PauseAccountSheet } from "./PauseAccountSheet";
import { BlockedUsersScreen } from "./BlockedUsersScreen";
import { toast } from "sonner";

type Sheet = null | "privacy" | "security";

export const ProfileScreen: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { friends }  = useFriends();
  const [pauseOpen, setPauseOpen]   = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [sheet, setSheet]           = useState<Sheet>(null);
  const [copied, setCopied]         = useState(false);

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>
      </div>
    );
  }

  const isPaused = profile.pauseUntil && profile.pauseUntil > Date.now();

  const copyPeerId = () => {
    navigator.clipboard.writeText(profile.peerId);
    setCopied(true);
    toast.success("Peer ID copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#06060F" }}>
      <PauseAccountSheet open={pauseOpen} onOpenChange={setPauseOpen} />
      <BlockedUsersScreen open={blockedOpen} onOpenChange={setBlockedOpen} />

      {/* Sub-sheets */}
      <AnimatePresence>
        {sheet === "privacy" && <PrivacySheet onClose={() => setSheet(null)} />}
        {sheet === "security" && <SecuritySheet peerId={profile.peerId} onClose={() => setSheet(null)} />}
      </AnimatePresence>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative px-5 pt-14 pb-8 overflow-hidden">
        {/* Ambient glow behind avatar */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,229,200,0.07) 0%, transparent 70%)" }}
        />

        <div className="flex flex-col items-center gap-4 relative">
          {/* Avatar with animated gradient ring */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, #00E5C8, #9B72F0, #FFB347, #00E5C8)",
                borderRadius: "50%",
                padding: "2px",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <Avatar
              className="relative w-24 h-24"
              style={{
                border: "3px solid #06060F",
                boxShadow: "0 0 30px rgba(0,229,200,0.2)",
              }}
            >
              <AvatarImage src={user.photoURL ?? undefined} />
              <AvatarFallback
                style={{ background: "rgba(0,229,200,0.08)", color: "#00E5C8", fontFamily: "Outfit", fontSize: "2rem", fontWeight: 700 }}
              >
                {profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center">
            <h2 className="font-display font-black text-2xl text-white tracking-tight">@{profile.username}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 text-center">
            {[
              { value: friends.length, label: "Friends" },
              { value: profile.totalShares, label: "Shares" },
              ...(profile.shareStreak > 0 ? [{ value: `🔥${profile.shareStreak}`, label: "Streak" }] : []),
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-display font-bold text-xl text-white">{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Paused banner */}
        {isPaused && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-2.5 rounded-xl text-center"
            style={{ background: "rgba(255,179,71,0.08)", border: "1px solid rgba(255,179,71,0.2)" }}
          >
            <p className="text-[13px] font-medium" style={{ color: "#FFB347" }}>
              Account paused until {new Date(profile.pauseUntil!).toLocaleDateString()}
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Peer ID ───────────────────────────────────────────────────────── */}
      <div className="px-5 mb-5">
        <motion.button
          onClick={copyPeerId}
          className="w-full flex items-center justify-between p-4 rounded-2xl text-left"
          style={{ background: "rgba(0,229,200,0.04)", border: "1px solid rgba(0,229,200,0.12)" }}
          whileTap={{ scale: 0.99 }}
        >
          <div>
            <p className="section-label mb-1">Your Peer ID</p>
            <p className="text-xs font-mono text-primary truncate max-w-[240px]">{profile.peerId}</p>
          </div>
          {copied ? (
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </motion.button>
      </div>

      {/* ── Settings list ─────────────────────────────────────────────────── */}
      <div className="px-5 space-y-2 flex-1">
        <p className="section-label px-1 mb-3">Settings</p>

        {[
          {
            icon: Shield, label: "Privacy Settings",
            desc: "Control who can find and contact you",
            color: "#00E5C8",
            onClick: () => setSheet("privacy"),
          },
          {
            icon: Lock, label: "Security",
            desc: "Encryption keys, session info",
            color: "#9B72F0",
            onClick: () => setSheet("security"),
          },
          {
            icon: UserX, label: "Blocked Users",
            desc: "Manage people you've blocked",
            color: "#FF8C42",
            onClick: () => setBlockedOpen(true),
          },
          {
            icon: Clock, label: "Pause Account",
            desc: "Temporarily disable file sharing",
            color: "#FFB347",
            onClick: () => setPauseOpen(true),
          },
        ].map(({ icon: Icon, label, desc, color, onClick }, i) => (
          <motion.button
            key={label}
            onClick={onClick}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
            style={{ background: "rgba(18,18,36,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ background: "rgba(18,18,36,0.85)", borderColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}14`, border: `1px solid ${color}28` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
          </motion.button>
        ))}

        {/* Sign out */}
        <motion.button
          onClick={signOut}
          className="w-full flex items-center gap-3 p-4 rounded-2xl text-left mt-4"
          style={{ background: "rgba(255,75,106,0.04)", border: "1px solid rgba(255,75,106,0.12)" }}
          whileHover={{ background: "rgba(255,75,106,0.08)" }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,75,106,0.1)", border: "1px solid rgba(255,75,106,0.2)" }}>
            <LogOut className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-[14px] font-medium text-destructive">Sign Out</span>
        </motion.button>
      </div>

      <div className="h-8" />
    </div>
  );
};

// ── Privacy Sheet ────────────────────────────────────────────────────────────
const PrivacySheet: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [settings, setSettings] = useState({
    discoverableByUsername: true,
    showOnlineStatus: true,
    allowFriendRequests: true,
    receiveFiles: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <SlidePanel title="Privacy" icon={<Shield className="w-5 h-5 text-primary" />} onClose={onClose}>
      {[
        { key: "discoverableByUsername" as const, label: "Discoverable by username", desc: "Allow others to find you in search" },
        { key: "showOnlineStatus" as const, label: "Show online status", desc: "Let friends see when you're active" },
        { key: "allowFriendRequests" as const, label: "Allow friend requests", desc: "Receive connection requests from others" },
        { key: "receiveFiles" as const, label: "Receive files", desc: "Accept incoming P2P file transfers" },
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between py-3.5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div>
            <p className="text-[14px] font-medium text-foreground">{label}</p>
            <p className="text-[11px] text-muted-foreground">{desc}</p>
          </div>
          <Toggle active={settings[key]} onClick={() => toggle(key)} />
        </div>
      ))}
    </SlidePanel>
  );
};

// ── Security Sheet ───────────────────────────────────────────────────────────
const SecuritySheet: React.FC<{ peerId: string; onClose: () => void }> = ({ peerId, onClose }) => (
  <SlidePanel title="Security" icon={<Lock className="w-5 h-5" style={{ color: "#9B72F0" }} />} onClose={onClose}>
    {[
      {
        icon: Fingerprint, label: "Identity Keys",
        value: "ECDH P-256 (local only)",
        color: "#00E5C8",
        desc: "Your private key is stored in IndexedDB and never leaves this device."
      },
      {
        icon: Key, label: "File Encryption",
        value: "AES-256-GCM",
        color: "#9B72F0",
        desc: "Files are encrypted end-to-end before transmission. The server never sees them."
      },
      {
        icon: Shield, label: "Transport Layer",
        value: "WebRTC DTLS 1.3",
        color: "#FFB347",
        desc: "Peer-to-peer connections are encrypted with DTLS 1.3."
      },
      {
        icon: Eye, label: "Data We Store",
        value: "Username, email, peer ID",
        color: "#FF8C42",
        desc: "Your profile info is in Firestore. File contents are never stored on any server."
      },
    ].map(({ icon: Icon, label, value, color, desc }) => (
      <div key={label} className="py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${color}14`, border: `1px solid ${color}28` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <p className="text-[14px] font-medium text-foreground">{label}</p>
          <span className="ml-auto text-[11px] font-mono px-2 py-0.5 rounded-lg"
            style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
            {value}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed pl-9">{desc}</p>
      </div>
    ))}
  </SlidePanel>
);

// ── Shared sub-components ─────────────────────────────────────────────────────
const SlidePanel: React.FC<{ title: string; icon: React.ReactNode; onClose: () => void; children: React.ReactNode }> = ({
  title, icon, onClose, children
}) => (
  <motion.div
    className="fixed inset-0 z-50 flex flex-col"
    style={{ background: "#06060F" }}
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    transition={{ type: "spring", stiffness: 380, damping: 38 }}
  >
    <div className="flex items-center gap-3 px-5 pt-14 pb-5">
      <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <ChevronRight className="w-4 h-4 text-muted-foreground rotate-180" />
      </button>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-display font-bold text-lg text-foreground">{title}</h2>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto px-5">{children}</div>
  </motion.div>
);

const Toggle: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <motion.button
    onClick={onClick}
    className="relative w-11 h-6 rounded-full flex-shrink-0"
    style={{
      background: active ? "linear-gradient(135deg, #00E5C8, #00B89C)" : "rgba(255,255,255,0.08)",
      border: active ? "none" : "1px solid rgba(255,255,255,0.12)",
      boxShadow: active ? "0 0 12px rgba(0,229,200,0.35)" : "none",
    }}
    animate={{ background: active ? "#00E5C8" : "rgba(255,255,255,0.08)" }}
  >
    <motion.span
      className="absolute top-1 w-4 h-4 rounded-full bg-white"
      animate={{ x: active ? 20 : 2 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
    />
  </motion.button>
);
