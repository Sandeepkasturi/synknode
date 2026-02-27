import React, { useState } from "react";
import { useReceiverPeer } from "@/hooks/useReceiverPeer";
import { LiveQueue } from "./LiveQueue";
import { Button } from "@/components/ui/button";
import { Radio, Power, Wifi, WifiOff, Lock, LogIn, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { OrbitalAnimation } from "@/components/OrbitalAnimation";
import { useAuth } from "@/context/AuthContext";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { ManageReceiversDialog } from "@/components/auth/ManageReceiversDialog";

export const ReceiverPanel: React.FC = () => {
  const { isConnected, isReceiver, startReceiver, stopReceiver, receiverCode } = useReceiverPeer();
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

      {/* Code Display */}
      {isReceiver && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-5 p-5 rounded-xl bg-primary/5 border border-primary/15"
        >
          <OrbitalAnimation size="sm" isTransferring={false} />
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Receiver code</p>
            <p className="text-2xl font-bold tracking-widest text-primary font-display">{receiverCode}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Share with senders</p>
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
