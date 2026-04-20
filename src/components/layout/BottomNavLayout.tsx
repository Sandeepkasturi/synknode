import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, Users, MessageCircle, User, QrCode
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useFriends } from "@/hooks/useFriends";

type NavTab = "share" | "friends" | "chat" | "qr" | "profile";

interface BottomNavLayoutProps {
  children: (tab: NavTab) => React.ReactNode;
}

const NAV_ITEMS: { tab: NavTab; icon: React.FC<{ className?: string }>; label: string }[] = [
  { tab: "share", icon: Share2, label: "Share" },
  { tab: "friends", icon: Users, label: "Friends" },
  { tab: "chat", icon: MessageCircle, label: "Chat" },
  { tab: "qr", icon: QrCode, label: "QR" },
  { tab: "profile", icon: User, label: "Profile" },
];

export const BottomNavLayout: React.FC<BottomNavLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>("share");
  const { totalUnread } = useChat();
  const { pendingRequests } = useFriends();

  const badges: Partial<Record<NavTab, number>> = {
    chat: totalUnread,
    friends: pendingRequests.length,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="h-full"
          >
            {children(activeTab)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="flex-shrink-0 border-t border-border/40 bg-[#111118]/95 backdrop-blur-xl"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-around px-2 pt-2">
          {NAV_ITEMS.map(({ tab, icon: Icon, label }) => {
            const isActive = activeTab === tab;
            const badge = badges[tab] ?? 0;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative flex flex-col items-center gap-1 px-4 py-1 rounded-xl group"
              >
                {/* Active bg pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                {/* Badge */}
                {badge > 0 && (
                  <div className="absolute top-0 right-2 min-w-[14px] h-[14px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
                    {badge > 99 ? "99+" : badge}
                  </div>
                )}

                <Icon
                  className={`h-5 w-5 relative transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium relative transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
