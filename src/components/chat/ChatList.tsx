import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat, Conversation } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface ChatListProps {
  onOpenConversation: (uid: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ onOpenConversation }) => {
  const { conversations, openConversation } = useChat();

  const handleOpen = (conv: Conversation) => {
    openConversation(conv.participantUid);
    onOpenConversation(conv.participantUid);
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/40 flex items-center justify-center mb-4">
          <MessageCircle className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No conversations yet</p>
        <p className="text-xs text-muted-foreground max-w-48">Start a conversation with a friend from the Friends tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 pb-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 pb-2">
        Messages
      </p>
      {conversations.map((conv, i) => (
        <motion.div
          key={conv.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer active:bg-secondary/50"
          onClick={() => handleOpen(conv)}
        >
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={conv.participantProfile?.photoURL ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {conv.participantProfile?.username?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                @{conv.participantProfile?.username ?? "Unknown"}
              </p>
              <p className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                {conv.lastMessageAt ? formatDistanceToNow(conv.lastMessageAt, { addSuffix: true }) : ""}
              </p>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-muted-foreground truncate flex-1">
                {conv.lastMessage || "No messages yet"}
              </p>
              {conv.unreadCount > 0 && (
                <span className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                  {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
