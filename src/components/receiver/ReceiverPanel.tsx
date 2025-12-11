import React from "react";
import { useReceiverPeer } from "@/hooks/useReceiverPeer";
import { LiveQueue } from "./LiveQueue";
import { Button } from "@/components/ui/button";
import { Radio, Power, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { OrbitalAnimation } from "@/components/OrbitalAnimation";

export const ReceiverPanel: React.FC = () => {
  const { isConnected, isReceiver, startReceiver, stopReceiver, receiverCode } = useReceiverPeer();

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/50">
        <div className="flex items-center gap-3">
          {isReceiver ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-2.5 rounded-full bg-green-500/20 ring-2 ring-green-500/30"
            >
              <Wifi className="h-5 w-5 text-green-500" />
            </motion.div>
          ) : (
            <div className="p-2.5 rounded-full bg-muted">
              <WifiOff className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">
              {isReceiver ? 'Receiver Active' : 'Receiver Inactive'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isReceiver ? `Listening on code: ${receiverCode}` : 'Click to start receiving files'}
            </p>
          </div>
        </div>

        <Button
          onClick={isReceiver ? stopReceiver : startReceiver}
          variant={isReceiver ? "destructive" : "default"}
          className={`gap-2 ${!isReceiver ? 'bg-gradient-to-r from-primary via-purple-500 to-primary hover:opacity-90' : ''}`}
        >
          {isReceiver ? (
            <>
              <Power className="h-4 w-4" />
              Stop
            </>
          ) : (
            <>
              <Radio className="h-4 w-4" />
              Start Receiver
            </>
          )}
        </Button>
      </div>

      {/* Static Code Display with Orbital Animation */}
      {isReceiver && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 p-6 rounded-xl bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-400/5 border border-primary/20"
        >
          <OrbitalAnimation size="sm" isTransferring={false} />
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-1">Your receiver code</p>
            <p className="text-3xl md:text-4xl font-bold tracking-widest bg-gradient-to-r from-primary via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              {receiverCode}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Share this code with senders</p>
          </div>
        </motion.div>
      )}

      {/* Live Queue */}
      <div className="border-t border-border/50 pt-6">
        <LiveQueue />
      </div>
    </div>
  );
};
