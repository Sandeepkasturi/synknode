import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Phone } from "lucide-react";

interface ComingSoonOverlayProps {
  children: React.ReactNode;
  /** Feature name shown in the overlay label */
  feature?: string;
}

/**
 * Wraps any element with a sophisticated glassmorphism "Coming Soon" overlay.
 * The wrapped content is still rendered (keeps layout stable) but is
 * visually locked behind the blur screen.
 */
export const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({
  children,
  feature = "This feature",
}) => {
  return (
    <div className="relative select-none">
      {/* Underlying content — dimmed */}
      <div className="pointer-events-none opacity-40 blur-[2px]">
        {children}
      </div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl overflow-hidden"
        style={{
          backdropFilter: "blur(12px) saturate(160%)",
          WebkitBackdropFilter: "blur(12px) saturate(160%)",
          background:
            "linear-gradient(135deg, rgba(9,9,16,0.72) 0%, rgba(0,229,200,0.06) 50%, rgba(9,9,16,0.72) 100%)",
          border: "1px solid rgba(0,229,200,0.12)",
        }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,229,200,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-3 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(0,229,200,0.08)",
            border: "1px solid rgba(0,229,200,0.18)",
            boxShadow: "0 0 24px rgba(0,229,200,0.12)",
          }}
        >
          <Phone className="h-6 w-6 text-primary" />

          {/* Sparkle badge */}
          <motion.div
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center"
          >
            <Sparkles className="h-2.5 w-2.5 text-primary" />
          </motion.div>
        </motion.div>

        {/* Label */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className="flex flex-col items-center gap-1 text-center px-4"
        >
          <span
            className="text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: "hsl(176 100% 45%)" }}
          >
            Coming Soon
          </span>
          <p className="text-sm font-medium text-foreground/80 leading-snug">
            {feature} is coming to SynkDrop
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Stay tuned for updates ✦
          </p>
        </motion.div>

        {/* Animated bottom line */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, hsl(176 100% 45%), transparent)" }}
          initial={{ width: "0%", left: "50%" }}
          animate={{ width: "70%", left: "15%" }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>
    </div>
  );
};
