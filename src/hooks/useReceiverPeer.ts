import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";

const STATIC_RECEIVER_CODE = "SRGEC";

export const useReceiverPeer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isReceiver, setIsReceiver] = useState(false);
  const { user } = useAuth();
  const { setReceiverMode, refreshQueue } = useQueue();

  const startReceiver = useCallback(async () => {
    if (!user) {
      toast.error("Please login to access receiver mode");
      return;
    }

    console.log("User authorized:", user.username);
    console.log("Starting receiver with code:", STATIC_RECEIVER_CODE);

    setIsConnected(true);
    setIsReceiver(true);
    setReceiverMode(true);
    
    // Refresh queue immediately
    await refreshQueue();
    
    toast.success("Receiver mode active! Code: SRGEC");
  }, [user, setReceiverMode, refreshQueue]);

  const stopReceiver = useCallback(() => {
    setIsConnected(false);
    setIsReceiver(false);
    setReceiverMode(false);
    toast.info("Receiver mode stopped");
  }, [setReceiverMode]);

  return {
    isConnected,
    isReceiver,
    startReceiver,
    stopReceiver,
    receiverCode: STATIC_RECEIVER_CODE
  };
};
