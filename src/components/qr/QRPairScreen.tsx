import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, ScanLine, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type QRMode = "show" | "scan";

interface QRPairScreenProps {
  onScannedPeerId?: (peerId: string) => void;
}

export const QRPairScreen: React.FC<QRPairScreenProps> = ({ onScannedPeerId }) => {
  const { peerId, profile } = useAuth();
  const [mode, setMode] = useState<QRMode>("show");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [scannerReady, setScannerReady] = useState(false);

  // ── Generate QR Code ────────────────────────────────────────────────────
  useEffect(() => {
    if (!peerId) return;
    const payload = JSON.stringify({ peerId, username: profile?.username });
    QRCode.toDataURL(payload, {
      width: 256,
      margin: 2,
      color: { dark: "#00E5C8", light: "#090910" },
      errorCorrectionLevel: "M",
    }).then(setQrDataUrl);
  }, [peerId, profile?.username]);

  // ── Start QR Scanner ────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "scan") return;

    const timeout = setTimeout(() => {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
      scanner.render(
        (decodedText) => {
          try {
            const payload = JSON.parse(decodedText);
            if (payload.peerId) {
              onScannedPeerId?.(payload.peerId);
              scanner.clear();
            }
          } catch {
            // Invalid QR — ignore
          }
        },
        (error) => {}
      );
      setScannerReady(true);
      return () => scanner.clear();
    }, 300);

    return () => clearTimeout(timeout);
  }, [mode, onScannedPeerId]);

  return (
    <div className="space-y-4 pb-4">
      {/* Mode tabs */}
      <div className="flex rounded-xl overflow-hidden border border-border/50 bg-secondary/20">
        {(["show", "scan"] as QRMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mode === m
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "show"
              ? <><QrCode className="h-4 w-4" /> My QR</>
              : <><ScanLine className="h-4 w-4" /> Scan</>}
          </button>
        ))}
      </div>

      {mode === "show" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 py-4"
        >
          {qrDataUrl ? (
            <div className="p-4 rounded-2xl bg-[#090910] border border-primary/20">
              <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
            </div>
          ) : (
            <div className="w-64 h-64 rounded-2xl bg-secondary/20 border border-border/40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">@{profile?.username}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Let your friend scan this to connect instantly
            </p>
          </div>
        </motion.div>
      )}

      {mode === "scan" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
          {!scannerReady && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting camera…
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Point your camera at a friend's SynkDrop QR code
          </p>
        </motion.div>
      )}
    </div>
  );
};
