// ─── Device Orientation / Turn-to-Share Gesture Engine ───────────────────────
// Detects sharp phone tilt gesture to initiate file transfer.

import { useState, useCallback, useRef } from "react";
import { storeOrientationPermission, loadOrientationPermission } from "@/hooks/useKeyManagement";
import { toast } from "sonner";

export type GestureState =
  | "IDLE"
  | "ARMED"
  | "GESTURE_DETECTED"
  | "TRANSFER_INITIATING"
  | "TRANSFERRING"
  | "COMPLETE"
  | "FAILED";

interface GestureTarget {
  targetPeerId: string;
  file: File;
}

export function useDeviceOrientation() {
  const [gestureState, setGestureState] = useState<GestureState>("IDLE");
  const [lastGamma, setLastGamma] = useState(0);
  const [lastBeta, setLastBeta] = useState(0);
  const target = useRef<GestureTarget | null>(null);
  const prevGamma = useRef<number>(0);
  const prevGammaTime = useRef<number>(Date.now());
  const crossingTime = useRef<number | null>(null);
  const crossingDirection = useRef<"left" | "right" | null>(null);
  const handlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  // ── Request iOS permission ────────────────────────────────────────────────
  const requestPermission = useCallback(async (): Promise<boolean> => {
    // Check cached permission
    const cached = await loadOrientationPermission();
    if (cached === true) return true;

    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const result = await (DeviceOrientationEvent as any).requestPermission();
        const granted = result === "granted";
        await storeOrientationPermission(granted);
        return granted;
      } catch {
        return false;
      }
    }

    // Android / desktop — always available
    await storeOrientationPermission(true);
    return true;
  }, []);

  // ── Orientation handler ────────────────────────────────────────────────────
  const createHandler = useCallback(() => {
    return (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 0;
      setLastGamma(gamma);
      setLastBeta(beta);

      const now = Date.now();
      const timeDelta = now - prevGammaTime.current;

      if (timeDelta >= 100) {
        const gammaDelta = Math.abs(gamma - prevGamma.current);
        const isRapid = gammaDelta > 25;

        // Detect crossing ±65 degrees
        const crossedLeft = gamma < -65;
        const crossedRight = gamma > 65;

        if ((crossedLeft || crossedRight) && isRapid) {
          const direction = crossedLeft ? "left" : "right";

          if (crossingDirection.current !== direction) {
            // New crossing direction
            crossingTime.current = now;
            crossingDirection.current = direction;
          } else if (crossingTime.current && now - crossingTime.current <= 700) {
            // Confirm crossing within 700ms window
            triggerGesture();
          }
        } else {
          // Reset if no crossing for 1s
          if (crossingTime.current && now - crossingTime.current > 1000) {
            crossingTime.current = null;
            crossingDirection.current = null;
          }
        }

        prevGamma.current = gamma;
        prevGammaTime.current = now;
      }
    };
  }, []);

  const triggerGesture = useCallback(() => {
    setGestureState("GESTURE_DETECTED");

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate([50, 30, 100]);
    }

    // Brief pause → TRANSFER_INITIATING
    setTimeout(() => {
      setGestureState("TRANSFER_INITIATING");
    }, 200);
  }, []);

  // ── Arm gesture ───────────────────────────────────────────────────────────
  const armGesture = useCallback(async (targetPeerId: string, file: File) => {
    const permitted = await requestPermission();
    if (!permitted) {
      toast.error("Motion permission required for Turn-to-Share.");
      return;
    }

    target.current = { targetPeerId, file };

    const handler = createHandler();
    handlerRef.current = handler;
    window.addEventListener("deviceorientation", handler);

    setGestureState("ARMED");
  }, [requestPermission, createHandler]);

  // ── Disarm gesture ────────────────────────────────────────────────────────
  const disarm = useCallback(() => {
    if (handlerRef.current) {
      window.removeEventListener("deviceorientation", handlerRef.current);
      handlerRef.current = null;
    }
    target.current = null;
    crossingTime.current = null;
    crossingDirection.current = null;
    setGestureState("IDLE");
  }, []);

  // ── Transition state manually (for transfer hook to use) ──────────────────
  const setTransferring = useCallback(() => setGestureState("TRANSFERRING"), []);
  const setComplete = useCallback(() => setGestureState("COMPLETE"), []);
  const setFailed = useCallback(() => setGestureState("FAILED"), []);

  return {
    gestureState,
    lastGamma,
    lastBeta,
    target: target.current,
    armGesture,
    disarm,
    requestPermission,
    setTransferring,
    setComplete,
    setFailed,
  };
}
