// ─── WebRTC Audio Call Hook ───────────────────────────────────────────────────
// Signaling via Firestore calls/{callId}. Audio-only for MVP.

import { useState, useCallback, useRef, useEffect } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { toast } from "sonner";

export type CallState = "idle" | "calling" | "ringing" | "connected" | "ended";
export type ConnectionQuality = "good" | "fair" | "poor" | "unknown";

export function useCall() {
  const { user } = useAuth();
  const { isFriend } = useFriends();
  const [callState, setCallState] = useState<CallState>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>("unknown");
  const [callId, setCallId] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    callerId: string;
    callerProfile: any;
  } | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const callDocUnsub = useRef<(() => void) | null>(null);
  const statsInterval = useRef<NodeJS.Timeout | null>(null);

  const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  // ── Listen for incoming calls ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const q = collection(db, "calls");
    // We poll by listening to our incoming call document
    // Simplified: listen on calls where calleeId = user.uid and status = ringing
    const unsub = onSnapshot(
      collection(db, "calls"),
      (snap) => {
        snap.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            if (data.calleeId === user.uid && data.status === "ringing") {
              const callerSnap = await getDoc(doc(db, "users", data.callerId));
              setIncomingCall({
                callId: change.doc.id,
                callerId: data.callerId,
                callerProfile: callerSnap.exists() ? callerSnap.data() : null,
              });
              setCallState("ringing");
            }
          }
        });
      }
    );

    return unsub;
  }, [user]);

  // ── Create RTCPeerConnection ───────────────────────────────────────────────
  const createPeerConnection = useCallback((cId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = async (event) => {
      if (!event.candidate) return;
      const candidateField = isInitiator ? "callerCandidates" : "calleeCandidates";
      const callRef = doc(db, "calls", cId);
      const snap = await getDoc(callRef);
      const existing = snap.data()?.[candidateField] ?? [];
      await updateDoc(callRef, {
        [candidateField]: [...existing, event.candidate.toJSON()],
      });
    };

    // Monitor connection quality
    statsInterval.current = setInterval(async () => {
      if (!pcRef.current) return;
      const stats = await pcRef.current.getStats();
      stats.forEach((report) => {
        if (report.type === "remote-inbound-rtp" && report.kind === "audio") {
          const rtt = report.roundTripTime;
          if (rtt === undefined) return;
          setConnectionQuality(rtt < 0.1 ? "good" : rtt < 0.3 ? "fair" : "poor");
        }
      });
    }, 3000);

    return pc;
  }, []);

  // ── Initiate a call ────────────────────────────────────────────────────────
  const initiateCall = useCallback(async (targetUid: string) => {
    if (!user) return;

    if (!isFriend(targetUid)) {
      toast.error("You can only call friends.");
      return;
    }

    // Check pause/block status
    const targetSnap = await getDoc(doc(db, "users", targetUid));
    if (targetSnap.exists()) {
      const targetData = targetSnap.data();
      if (targetData.pauseUntil && targetData.pauseUntil.toMillis() > Date.now()) {
        toast.error("This user's account is paused.");
        return;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);

      const cId = `${user.uid}_${targetUid}_${Date.now()}`;
      setCallId(cId);

      const pc = createPeerConnection(cId, true);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await setDoc(doc(db, "calls", cId), {
        callerId: user.uid,
        calleeId: targetUid,
        status: "ringing",
        offer: { type: offer.type, sdp: offer.sdp },
        answer: null,
        callerCandidates: [],
        calleeCandidates: [],
        createdAt: serverTimestamp(),
      });

      setCallState("calling");

      // Listen for answer
      const unsub = onSnapshot(doc(db, "calls", cId), async (snap) => {
        const data = snap.data();
        if (!data) return;

        if (data.status === "accepted" && data.answer && pc.signalingState !== "stable") {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          // Add callee ICE candidates
          (data.calleeCandidates || []).forEach((c: RTCIceCandidateInit) => {
            pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
          });
          setCallState("connected");
        }
        if (data.status === "declined" || data.status === "ended") {
          await endCall();
        }
      });

      callDocUnsub.current = unsub;
    } catch (error) {
      toast.error("Failed to access microphone.");
      setCallState("idle");
    }
  }, [user, isFriend, createPeerConnection]);

  // ── Accept incoming call ───────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !user) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);

      const cId = incomingCall.callId;
      const callSnap = await getDoc(doc(db, "calls", cId));
      if (!callSnap.exists()) return;
      const callData = callSnap.data();

      const pc = createPeerConnection(cId, false);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await updateDoc(doc(db, "calls", cId), {
        status: "accepted",
        answer: { type: answer.type, sdp: answer.sdp },
      });

      // Add caller ICE candidates
      (callData.callerCandidates || []).forEach((c: RTCIceCandidateInit) => {
        pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      });

      // Listen for new caller candidates
      const unsub = onSnapshot(doc(db, "calls", cId), (snap) => {
        const data = snap.data();
        if (!data) return;
        (data.callerCandidates || []).forEach((c: RTCIceCandidateInit) => {
          pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        });
        if (data.status === "ended") endCall();
      });

      callDocUnsub.current = unsub;
      setCallId(cId);
      setCallState("connected");
      setIncomingCall(null);
    } catch (error) {
      toast.error("Failed to accept call.");
    }
  }, [incomingCall, user, createPeerConnection]);

  // ── Decline incoming call ──────────────────────────────────────────────────
  const declineCall = useCallback(async () => {
    if (!incomingCall) return;
    await updateDoc(doc(db, "calls", incomingCall.callId), { status: "declined" });
    setIncomingCall(null);
    setCallState("idle");
  }, [incomingCall]);

  // ── End active call ────────────────────────────────────────────────────────
  const endCall = useCallback(async () => {
    if (callId) {
      try {
        await updateDoc(doc(db, "calls", callId), { status: "ended" });
      } catch {}
    }

    pcRef.current?.close();
    pcRef.current = null;
    localStream?.getTracks().forEach((t) => t.stop());
    callDocUnsub.current?.();
    if (statsInterval.current) clearInterval(statsInterval.current);

    setLocalStream(null);
    setRemoteStream(null);
    setCallState("ended");
    setCallId(null);
    setConnectionQuality("unknown");

    setTimeout(() => setCallState("idle"), 1000);
  }, [callId, localStream]);

  const toggleMute = useCallback(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((prev) => !prev);
  }, [localStream]);

  return {
    callState,
    localStream,
    remoteStream,
    isMuted,
    connectionQuality,
    incomingCall,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
  };
}
