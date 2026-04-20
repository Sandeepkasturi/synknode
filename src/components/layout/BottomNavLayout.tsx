import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Users, MessageCircle, User, QrCode } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useFriends } from "@/hooks/useFriends";

type NavTab = "share" | "friends" | "chat" | "qr" | "profile";

interface BottomNavLayoutProps {
  children: (tab: NavTab) => React.ReactNode;
}

const NAV_ITEMS: { tab: NavTab; icon: React.FC<{ className?: string }>; label: string }[] = [
  { tab: "share",   icon: Share2,        label: "Share"   },
  { tab: "friends", icon: Users,         label: "Friends" },
  { tab: "chat",    icon: MessageCircle, label: "Chat"    },
  { tab: "qr",      icon: QrCode,        label: "Scan"    },
  { tab: "profile", icon: User,          label: "Me"      },
];

export const BottomNavLayout: React.FC<BottomNavLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>("share");
  const { totalUnread } = useChat();
  const { pendingRequests } = useFriends();

  const badges: Partial<Record<NavTab, number>> = {
    chat:    totalUnread,
    friends: pendingRequests.length,
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "#06060F" }}>
      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="h-full"
          >
            {children(activeTab)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom Nav ───────────────────────────────────────────────────── */}
      <nav
        className="flex-shrink-0 relative"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        {/* Glass strip */}
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(7,7,18,0.85)",
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        />

        {/* Nav items */}
        <div className="relative flex items-center justify-around px-2 pt-3">
          {NAV_ITEMS.map(({ tab, icon: Icon, label }) => {
            const isActive = activeTab === tab;
            const badge   = badges[tab] ?? 0;

            return (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl"
                whileTap={{ scale: 0.88 }}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "rgba(0,229,200,0.08)",
                      border: "1px solid rgba(0,229,200,0.15)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Badge */}
                <AnimatePresence>
                  {badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 right-1.5 min-w-[15px] h-[15px] rounded-full text-[9px] font-bold flex items-center justify-center px-0.5 z-10"
                      style={{
                        background: "linear-gradient(135deg, #00E5C8, #00B89C)",
                        color: "#06060F",
                        boxShadow: "0 0 8px rgba(0,229,200,0.5)",
                      }}
                    >
                      {badge > 9 ? "9+" : badge}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icon */}
                <div className="relative">
                  <Icon
                    className="h-[22px] w-[22px] transition-all duration-200"
                    style={{
                      color: isActive ? "#00E5C8" : "rgba(255,255,255,0.35)",
                      filter: isActive ? "drop-shadow(0 0 6px rgba(0,229,200,0.5))" : "none",
                    }}
                  />
                </div>

                {/* Label */}
                <span
                  className="text-[10px] font-medium transition-all duration-200 relative"
                  style={{
                    color: isActive ? "#00E5C8" : "rgba(255,255,255,0.3)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
