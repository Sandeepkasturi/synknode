import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, MicOff, Mic } from "lucide-react";
import { ConnectionQuality } from "@/hooks/useCall";

interface ActiveCallScreenProps {
  remoteProfile: {
    username: string;
    photoURL?: string | null;
  } | null;
  isMuted: boolean;
  connectionQuality: ConnectionQuality;
  onToggleMute: () => void;
  onEndCall: () => void;
}

export const ActiveCallScreen: React.FC<ActiveCallScreenProps> = ({
  remoteProfile,
  isMuted,
  connectionQuality,
  onToggleMute,
  onEndCall,
}) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const qualityColor = {
    good: "#00D68F",
    fair: "#FFB347",
    poor: "#FF4C6A",
    unknown: "#8888A8",
  }[connectionQuality];

  const qualityLabel = {
    good: "Good",
    fair: "Fair",
    poor: "Poor signal",
    unknown: "Connecting",
  }[connectionQuality];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between py-20 px-6"
      style={{ background: "linear-gradient(180deg, #090910 0%, #111118 100%)" }}
    >
      {/* Remote user */}
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Avatar className="w-32 h-32 border-2 border-primary/20">
            <AvatarImage src={remoteProfile?.photoURL ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-5xl font-semibold">
              {remoteProfile?.username?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-foreground">
            @{remoteProfile?.username}
          </h2>
          <p className="text-4xl font-mono font-light text-muted-foreground mt-3">
            {formatDuration(duration)}
          </p>
        </div>

        {/* Connection quality indicator */}
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: qualityColor, boxShadow: `0 0 6px ${qualityColor}` }}
          />
          <span className="text-xs text-muted-foreground">{qualityLabel}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleMute}
          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-colors ${
            isMuted
              ? "bg-destructive/10 border-destructive/40 text-destructive"
              : "bg-secondary/40 border-border/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEndCall}
          className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center text-white"
        >
          <Phone className="h-8 w-8 rotate-[135deg]" />
        </motion.button>
      </div>
    </motion.div>
  );
};
