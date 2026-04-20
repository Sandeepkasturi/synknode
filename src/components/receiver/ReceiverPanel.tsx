import React, { useState } from "react";
import { useReceiverPeer } from "@/hooks/useReceiverPeer";
import { LiveQueue } from "./LiveQueue";
import { Button } from "@/components/ui/button";
import { Radio, Power, Wifi, WifiOff, LogIn, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { OrbitalAnimation } from "@/components/OrbitalAnimation";
import { useAuth } from "@/context/AuthContext";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { toast } from "sonner";

export const ReceiverPanel: React.FC = () => {
  const { isConnected, isReceiver, startReceiver, stopReceiver, receiverCode } = useReceiverPeer();
  const { user, profile, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [copied, setCopied] = useState(false);

  // Any signed-in user can be a receiver — no admin gate
  const handleStartReceiver = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    startReceiver();
  };

  const handleCopyPeerId = () => {
    if (!receiverCode) return;
    navigator.clipboard.writeText(receiverCode);
    setCopied(true);
    toast.success("Peer ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const abbreviatedId = receiverCode
    ? receiverCode.slice(0, 8) + "…" + receiverCode.slice(-4)
    : null;

  return (
    <div className="space-y-5">
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />

      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border/50">
        <div className="flex items-center gap-3">
          {isReceiver ? (
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-2 rounded-full bg-primary/15"
            >
              <Wifi className="h-4 w-4 text-primary" />
            </motion.div>
          ) : (
            <div className="p-2 rounded-full bg-muted">
              {user
                ? <WifiOff className="h-4 w-4 text-muted-foreground" />
                : <LogIn className="h-4 w-4 text-muted-foreground" />}
            </div>
          )}
          <div>
            <p className="font-medium text-sm text-foreground">
              {isReceiver ? "Receiving" : "Inactive"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isReceiver
                ? `@${profile?.username ?? "you"}`
                : user
                  ? "Start to receive files"
                  : "Sign in required"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-xs text-muted-foreground"
            >
              Sign Out
            </Button>
          )}

          <Button
            onClick={isReceiver ? stopReceiver : handleStartReceiver}
            variant={isReceiver ? "destructive" : "default"}
            size="sm"
            className={!isReceiver && user ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
          >
            {isReceiver ? (
              <><Power className="h-3.5 w-3.5 mr-1" /> Stop</>
            ) : (
              <>{user ? <Radio className="h-3.5 w-3.5 mr-1" /> : <LogIn className="h-3.5 w-3.5 mr-1" />}
                {user ? "Start" : "Sign In"}</>
            )}
          </Button>
        </div>
      </div>

      {/* Peer ID Display (replaces static "SRGEC") */}
      {isReceiver && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-5 p-5 rounded-xl bg-primary/5 border border-primary/15"
        >
          <OrbitalAnimation size="sm" isTransferring={false} />
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Your receiver</p>
            <p className="text-lg font-bold font-display text-foreground">
              @{profile?.username}
            </p>
            <div className="flex items-center gap-2 mt-1 justify-center">
              <p className="text-[11px] font-mono text-muted-foreground">{abbreviatedId}</p>
              <button
                onClick={handleCopyPeerId}
                className="p-1 hover:bg-primary/10 rounded transition-colors"
                title="Copy full Peer ID"
              >
                {copied
                  ? <Check className="h-3 w-3 text-[#00D68F]" />
                  : <Copy className="h-3 w-3 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Queue */}
      <div className="border-t border-border/50 pt-5">
        <LiveQueue />
      </div>
    </div>
  );
};
