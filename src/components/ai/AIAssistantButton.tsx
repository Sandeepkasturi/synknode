import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAIAssistant, AIMessage } from "@/hooks/useAIAssistant";
import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/hooks/useCall";
import { useFriends } from "@/hooks/useFriends";
import { Sparkles, X, Send, Loader2, ChevronDown } from "lucide-react";
import ReactDOM from "react-dom";

interface AIAssistantButtonProps {
  context?: {
    onlineFriendsCount?: number;
    activeTransfersCount?: number;
    accountPaused?: boolean;
  };
}

export const AIAssistantButton: React.FC<AIAssistantButtonProps> = ({ context }) => {
  const { profile } = useAuth();
  const { friends } = useFriends();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const assistantContext = {
    onlineFriendsCount: context?.onlineFriendsCount ?? friends.filter((f) => f.online).length,
    ...context,
  };

  const { messages, sendMessage, isLoading, clearHistory } = useAIAssistant(assistantContext);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    const msg = text.trim();
    setText("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const portal = typeof document !== "undefined" ? document.body : null;
  if (!portal) return null;

  return (
    <>
      {/* FAB button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-5 z-30 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center glow-teal-sm"
        style={{ display: open ? "none" : "flex" }}
        title="AI Assistant"
      >
        <Sparkles className="h-5 w-5 text-primary" />
      </motion.button>

      {/* Chat panel portal */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="fixed bottom-24 left-4 right-4 z-40 rounded-2xl border border-border/30 overflow-hidden glass"
              style={{ maxHeight: "60vh", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">SynkDrop AI</span>
                  <span className="text-xs text-muted-foreground">· Gemini 2.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearHistory}
                    className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 hover:bg-secondary/50 rounded-full transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1 hover:bg-secondary/50 rounded-full transition-colors text-muted-foreground"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: "calc(60vh - 120px)" }}>
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <Sparkles className="h-8 w-8 text-primary/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Hi @{profile?.username}! 👋</p>
                    <p className="text-xs text-muted-foreground mt-1">Ask me anything about SynkDrop.</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                          msg.role === "user"
                            ? "bg-primary/15 text-foreground rounded-br-sm"
                            : "bg-secondary/60 text-foreground rounded-bl-sm"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-1 mb-1">
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span className="text-[10px] text-primary font-medium">SynkDrop AI</span>
                          </div>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-secondary/60 px-3 py-2 rounded-xl flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                        <span className="text-xs text-muted-foreground">Thinking…</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-end gap-2 p-3 border-t border-border/30">
                <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything…"
                  className="flex-1 min-h-[36px] max-h-24 resize-none bg-secondary/30 border-border focus:border-primary text-sm"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!text.trim() || isLoading}
                  className="h-9 w-9 p-0 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
                  size="sm"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        portal
      )}
    </>
  );
};
