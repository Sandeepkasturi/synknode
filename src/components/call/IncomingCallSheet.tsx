import React, { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Phone, PhoneOff } from "lucide-react";
import { motion } from "framer-motion";

interface IncomingCallSheetProps {
  open: boolean;
  callerProfile: {
    username: string;
    photoURL?: string | null;
  } | null;
  onAccept: () => void;
  onDecline: () => void;
}

const COUNTDOWN_SECONDS = 30;

export const IncomingCallSheet: React.FC<IncomingCallSheetProps> = ({
  open,
  callerProfile,
  onAccept,
  onDecline,
}) => {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!open) {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={() => onDecline()}>
      <SheetContent side="bottom" className="bg-[#111118] border-t border-border/30 rounded-t-2xl pb-12">
        <div className="flex flex-col items-center gap-6 pt-6">
          {/* Caller avatar with ring animation */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.3, 0.8] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <Avatar className="w-20 h-20 border-2 border-primary/20">
              <AvatarImage src={callerProfile?.photoURL ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {callerProfile?.username?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center">
            <p className="text-xl font-display font-bold text-foreground">
              @{callerProfile?.username}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Incoming call…</p>
          </div>

          {/* Countdown */}
          <div className="w-full max-w-xs space-y-1.5">
            <Progress value={(countdown / COUNTDOWN_SECONDS) * 100} className="h-1" />
            <p className="text-xs text-center text-muted-foreground">
              Auto-declining in {countdown}s
            </p>
          </div>

          {/* Accept / Decline buttons */}
          <div className="flex gap-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDecline}
              className="w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/40 flex items-center justify-center text-destructive"
            >
              <PhoneOff className="h-7 w-7" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAccept}
              className="w-16 h-16 rounded-full bg-[#00D68F]/10 border-2 border-[#00D68F]/40 flex items-center justify-center text-[#00D68F]"
            >
              <Phone className="h-7 w-7" />
            </motion.button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
