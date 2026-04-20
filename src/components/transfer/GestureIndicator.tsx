import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { GestureState } from "@/hooks/useDeviceOrientation";

interface GestureIndicatorProps {
  gestureState: GestureState;
  lastGamma: number;
  onManualSend: () => void;
}

export const GestureIndicator: React.FC<GestureIndicatorProps> = ({
  gestureState,
  lastGamma,
  onManualSend,
}) => {
  const isDetected = gestureState === "GESTURE_DETECTED";

  return (
    <AnimatePresence>
      {(gestureState === "ARMED" || gestureState === "GESTURE_DETECTED") && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-24 right-5 z-40 flex flex-col items-center gap-2"
        >
          {/* Phone tilt indicator */}
          <div className="relative flex items-center justify-center w-16 h-16">
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/40"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />

            {/* Radial expansion on detection */}
            <AnimatePresence>
              {isDetected && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{}}
                  transition={{ duration: 0.5, ease: [0.4, 0, 1, 1] }}
                />
              )}
            </AnimatePresence>

            {/* Inner circle */}
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <motion.div
                style={{ rotate: lastGamma }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Phone className="h-5 w-5 text-primary" />
              </motion.div>
            </div>
          </div>

          <p className="text-[10px] text-primary font-medium text-center">
            Tilt to send
          </p>

          {/* Manual send fallback */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onManualSend}
            className="px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-[10px] text-primary font-medium hover:bg-primary/20 transition-colors"
          >
            Send now
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
