import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Shield, Zap, Lock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  { icon: Zap,    label: "Instant sharing",        desc: "P2P transfers at full speed" },
  { icon: Lock,   label: "End-to-end encrypted",   desc: "AES-256-GCM, keys stay local" },
  { icon: Shield, label: "No server middleman",    desc: "Files never touch our servers" },
];

export const LoginDialog: React.FC<LoginDialogProps> = ({ open }) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try { await signInWithGoogle(); }
    catch { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "#06060F" }}
        >
          {/* ── Ambient orbs ─────────────────────────────────────────────── */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(0,229,200,0.12) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -15, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(155,114,240,0.1) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.15, 1], x: [0, -25, 0], y: [0, 20, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,179,71,0.04) 0%, transparent 70%)" }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </div>

          {/* ── Hero section ─────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-center justify-center w-full px-8 pt-safe">

            {/* Logo mark */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{ background: "conic-gradient(from 0deg, #00E5C8, #9B72F0, #FFB347, #00E5C8)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                sx={{ borderRadius: "24px", padding: "2px" }}
              />
              <div
                className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #0D0D1A 0%, #12122A 100%)",
                  border: "1.5px solid rgba(0,229,200,0.3)",
                  boxShadow: "0 0 40px rgba(0,229,200,0.2), inset 0 1px 0 rgba(255,255,255,0.06)"
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M18 4L30 11V25L18 32L6 25V11L18 4Z" stroke="#00E5C8" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                    <path d="M18 4L18 32M6 11L30 25M30 11L6 25" stroke="#00E5C8" strokeWidth="0.75" opacity="0.4"/>
                    <circle cx="18" cy="18" r="4" fill="#00E5C8" opacity="0.9"/>
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="font-display font-black text-5xl tracking-tighter text-gradient-teal mb-1">
                SynkDrop
              </h1>
              <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                Share at the speed of intent
              </p>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              className="flex flex-col gap-3 w-full max-w-xs mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {features.map(({ icon: Icon, label, desc }, i) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: "rgba(13,13,26,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(12px)"
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(0,229,200,0.1)", border: "1px solid rgba(0,229,200,0.2)" }}>
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground leading-none mb-0.5">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ── Sign-in section ───────────────────────────────────────────── */}
          <motion.div
            className="w-full px-6 pb-10 pt-6 flex flex-col gap-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Google sign-in button */}
            <motion.button
              onClick={handleSignIn}
              disabled={loading}
              className="relative w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-semibold text-[15px] overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.97)",
                color: "#1a1a2e",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.1) inset"
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                  <ArrowRight className="w-4 h-4 ml-auto opacity-40" />
                </>
              )}
            </motion.button>

            <p className="text-center text-[11px] text-muted-foreground px-4 leading-relaxed">
              Your encryption keys never leave your device.{" "}
              <span className="text-primary/70">Privacy by design.</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
