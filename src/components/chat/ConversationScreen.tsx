import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat, Message } from "@/hooks/useChat";
import { useFriends } from "@/hooks/useFriends";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { ArrowLeft, Send, Check, CheckCheck, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationScreenProps {
  participantUid: string;
  participantProfile: UserProfile | null;
  onBack: () => void;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  participantUid,
  participantProfile,
  onBack,
}) => {
  const { user, profile } = useAuth();
  const { messages, sendMessage, markRead, conversations } = useChat();
  const { isFriend, sendFriendRequest } = useFriends();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const conv = conversations.find((c) => c.participantUid === participantUid);
  const isUserFriend = isFriend(participantUid);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark read when opening
  useEffect(() => {
    if (conv?.id) markRead(conv.id);
  }, [conv?.id]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msg = text.trim();
    setText("");
    setSending(true);
    try {
      await sendMessage(participantUid, msg);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ReadStatus = ({ msg }: { msg: Message }) => {
    if (msg.senderId !== user?.uid) return null;
    if (msg.readAt) return <CheckCheck className="h-3 w-3 text-primary inline ml-1" />;
    if (msg.deliveredAt) return <CheckCheck className="h-3 w-3 text-muted-foreground inline ml-1" />;
    return <Check className="h-3 w-3 text-muted-foreground inline ml-1" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/40 bg-card/50 backdrop-blur-sm flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-0 h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="w-9 h-9">
          <AvatarImage src={participantProfile?.photoURL ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {participantProfile?.username?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">@{participantProfile?.username}</p>
        </div>
      </div>

      {/* Non-friend banner */}
      {!isUserFriend && (
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-amber-400">Not friends · 5 message limit applies</p>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-amber-400 hover:bg-amber-500/10"
            onClick={() => sendFriendRequest(participantUid)}
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Add Friend
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <p className="text-sm text-muted-foreground">
              Start your encrypted conversation with @{participantProfile?.username}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              🔒 End-to-end encrypted
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isOwn = msg.senderId === user?.uid;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm break-words ${
                      isOwn
                        ? "bg-primary/15 text-foreground rounded-br-sm"
                        : "bg-secondary/60 text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.plaintext}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(msg.sentAt, { addSuffix: true })}
                    </span>
                    <ReadStatus msg={msg} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-end gap-2 p-4 border-t border-border/40 flex-shrink-0">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message… (Enter to send)"
          className="flex-1 min-h-[44px] max-h-32 resize-none bg-secondary/40 border-border focus:border-primary text-sm"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="h-11 w-11 p-0 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
