import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, FileIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GestureState } from "@/hooks/useDeviceOrientation";
import { UserProfile } from "@/context/AuthContext";

interface QuickDropWindowProps {
  gestureState: GestureState;
  file: File | null;
  sender: UserProfile | null;
  receiver: UserProfile | null;
  progress: number; // 0-100
  onCancel: () => void;
}

function CircularProgress({ value }: { value: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(0,229,200,0.1)" strokeWidth="6" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgb(0,229,200)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-display font-bold text-primary">{value}%</span>
        <span className="text-[10px] text-muted-foreground">sending</span>
      </div>
    </div>
  );
}

export const QuickDropWindow: React.FC<QuickDropWindowProps> = ({
  gestureState,
  file,
  sender,
  receiver,
  progress,
  onCancel,
}) => {
  const isVisible = ["GESTURE_DETECTED", "TRANSFER_INITIATING", "TRANSFERRING", "COMPLETE", "FAILED"].includes(gestureState);
  const isComplete = gestureState === "COMPLETE";
  const isFailed = gestureState === "FAILED";

  const portal = typeof document !== "undefined" ? document.body : null;
  if (!portal) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between py-16 px-6"
          style={{
            background: "rgba(9, 9, 16, 0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Sender → Receiver */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-14 h-14 border-2 border-primary/30">
                <AvatarImage src={sender?.photoURL ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {sender?.username?.[0]?.toUpperCase() ?? "S"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{sender?.username ?? "You"}</span>
            </div>

            {/* Animated arrow */}
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3], x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-14 h-14 border-2 border-primary/30">
                <AvatarImage src={receiver?.photoURL ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {receiver?.username?.[0]?.toUpperCase() ?? "R"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{receiver?.username ?? "Receiver"}</span>
            </div>
          </div>

          {/* File Info */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-surface-variant border border-border/50 flex items-center justify-center">
              <FileIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-foreground">{file?.name ?? "File"}</p>
              <p className="text-sm text-muted-foreground">
                {file ? (file.size / 1024).toFixed(1) + " KB" : ""}
              </p>
            </div>

            {/* Progress ring or complete state */}
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  key="complete"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle className="w-20 h-20 text-[#00D68F]" />
                </motion.div>
              ) : isFailed ? (
                <motion.div
                  key="failed"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center"
                >
                  <X className="w-10 h-10 text-destructive" />
                </motion.div>
              ) : (
                <CircularProgress key="progress" value={progress} />
              )}
            </AnimatePresence>
          </div>

          {/* Cancel button */}
          {!isComplete && !isFailed && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    portal
  );
};
