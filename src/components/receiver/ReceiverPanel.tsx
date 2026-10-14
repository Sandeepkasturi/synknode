import React, { useState } from "react";
import { useReceiverPeer } from "@/hooks/useReceiverPeer";
import { LiveQueue } from "./LiveQueue";
import { Button } from "@/components/ui/button";
import { Radio, Power, Wifi, WifiOff, Lock, LogIn, Settings, Copy, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQueue } from "@/context/QueueContext";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { ManageReceiversDialog } from "@/components/auth/ManageReceiversDialog";

export const ReceiverPanel: React.FC = () => {
  const { isConnected, isReceiver, startReceiver, stopReceiver, receiverCode } = useReceiverPeer();
  const { queue } = useQueue();
  const bytes = queue.reduce((s, e) => s + e.files.reduce((n, f) => n + f.size, 0), 0);
  const copyCode = async () => { try { await navigator.clipboard.writeText("SRGEC"); toast.success("Receiver code copied"); } catch { toast.error("Unable to copy code"); } };
  const shareCode = async () => { try { if (navigator.share) await navigator.share({ title: "SynkNode", text: "Send files to SRGEC", url: window.location.origin }); else await copyCode(); } catch { /* Share cancelled */ } };
  const { user, isPrimaryAdmin, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showManageReceivers, setShowManageReceivers] = useState(false);

  const handleStartReceiver = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    startReceiver();
  };

  return (
    <div className="space-y-5">
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      <ManageReceiversDialog open={showManageReceivers} onOpenChange={setShowManageReceivers} />

      {/* Connection Status */}
      <div className="flex flex-wrap gap-3 items-center justify-between p-4 rounded-lg bg-secondary/40 border border-border/50">
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
              {user ? <WifiOff className="h-4 w-4 text-muted-foreground" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
          )}
          <div>
            <p className="font-medium text-sm text-foreground">
              {isReceiver ? 'Receiving' : 'Inactive'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isReceiver
                ? `Code: ${receiverCode}`
                : user
                  ? 'Start to receive files'
                  : 'Login required'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPrimaryAdmin && (
            <Button variant="ghost" size="sm" onClick={() => setShowManageReceivers(true)} className="text-xs text-primary">
              <Settings className="h-3.5 w-3.5 mr-1" />
              Manage
            </Button>
          )}
          
          {user && (
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-xs text-muted-foreground">
              Sign Out
            </Button>
          )}

          <Button
            onClick={isReceiver ? stopReceiver : handleStartReceiver}
            variant={isReceiver ? "destructive" : "default"}
            size="sm"
            className={!isReceiver && user ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}
          >
            {isReceiver ? (
              <><Power className="h-3.5 w-3.5 mr-1" /> Stop</>
            ) : (
              <>{user ? <Radio className="h-3.5 w-3.5 mr-1" /> : <LogIn className="h-3.5 w-3.5 mr-1" />}
                {user ? "Start" : "Login"}</>
            )}
          </Button>
        </div>
      </div>

      <div className="receiver-code-panel">
        <div><p className="text-xs text-muted-foreground">Your receiver code</p><div className="flex items-center gap-2 mt-2"><span className="receiver-code">SRGEC</span><Button variant="ghost" size="icon" onClick={copyCode} aria-label="Copy receiver code" title="Copy code"><Copy /></Button></div><p className="mt-2 text-[11px] text-muted-foreground">Share this code with senders.</p></div>
        <div className="receiver-code-actions"><Button variant="outline" size="sm" onClick={copyCode}><Copy />Copy code</Button><Button variant="outline" size="sm" onClick={shareCode}><Share2 />Share</Button></div>
      </div>
      {isReceiver && <div className="receiver-stats"><div><strong>{queue.reduce((s, e) => s + e.files.length, 0)}</strong><p>Incoming files</p></div><div><strong>{queue.length}</strong><p>Senders</p></div><div><strong>{bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`}</strong><p>Total size</p></div></div>}

      {/* Queue */}
      <div className="border-t border-border/50 pt-5">
        <LiveQueue />
      </div>
    </div>
  );
};
