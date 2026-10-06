import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, AlertCircle, Clock } from "lucide-react";

interface ShareNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  senderName: string;
  fileCount: number;
}

export const ShareNotification: React.FC<ShareNotificationProps> = ({
  isOpen,
  onClose,
  senderName,
  fileCount,
}) => {
  const [autoClose, setAutoClose] = useState(true);

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(onClose, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-card border border-border/60 rounded-lg shadow-lg overflow-hidden backdrop-blur-sm">
            {/* Success bar */}
            <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
            
            <div className="p-4 space-y-3">
              {/* Header with icon */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm">
                    Files Shared Successfully!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {senderName} shared {fileCount} file{fileCount !== 1 ? 's' : ''} to SRGEC
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Download window info */}
              <div className="pl-13 space-y-2 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                  <Clock className="w-3.5 h-3.5 text-primary/60" />
                  <span className="font-medium">Download Window: 60 Hours</span>
                </div>
                <p className="text-xs text-muted-foreground pl-5.5">
                  Recipients have 60 hours to download the files before they expire.
                </p>
              </div>

              {/* Close statement */}
              <div className="pt-2 border-t border-border/40">
                <p className="text-xs text-muted-foreground italic">
                  Files will be automatically cleaned up after the download window expires.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
