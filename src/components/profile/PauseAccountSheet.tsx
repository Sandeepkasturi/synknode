import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

const DURATIONS = [
  { label: "1 day", days: 1 },
  { label: "3 days", days: 3 },
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
  { label: "30 days", days: 30 },
];

interface PauseAccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PauseAccountSheet: React.FC<PauseAccountSheetProps> = ({ open, onOpenChange }) => {
  const { user, profile, refreshProfile } = useAuth();

  const isPaused = profile?.pauseUntil && profile.pauseUntil > Date.now();

  const pauseAccount = async (days: number) => {
    if (!user) return;
    const pauseUntil = new Date();
    pauseUntil.setDate(pauseUntil.getDate() + days);

    await updateDoc(doc(db, "users", user.uid), {
      pauseUntil: Timestamp.fromDate(pauseUntil),
    });

    await refreshProfile();
    toast.success(`Account paused for ${days} day${days > 1 ? "s" : ""}`);
    onOpenChange(false);
  };

  const resumeAccount = async () => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { pauseUntil: null });
    await refreshProfile();
    toast.success("Account resumed!");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-[#111118] border-t border-border/30 rounded-t-2xl pb-10">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5 text-amber-400" />
            Pause Account
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            While paused, you can still chat but cannot send files or make calls.
          </p>

          {isPaused ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-sm text-amber-400">
                  Paused until {new Date(profile!.pauseUntil!).toLocaleDateString()}
                </p>
              </div>
              <Button
                onClick={resumeAccount}
                className="w-full bg-[#00D68F]/10 text-[#00D68F] border border-[#00D68F]/30 hover:bg-[#00D68F]/20"
              >
                Resume Account Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DURATIONS.map((opt) => (
                <motion.button
                  key={opt.days}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => pauseAccount(opt.days)}
                  className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors text-center"
                >
                  <span className="text-base font-bold font-display text-amber-400">{opt.label}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
