
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { TransferStatus } from "../../types/fileTransfer.types";

export const usePeerConnection = (
  transferStatus: TransferStatus, 
  setTransferStatus: React.Dispatch<React.SetStateAction<TransferStatus>>,
  currentFiles: File[],
  setPendingPermission: React.Dispatch<React.SetStateAction<any>>,
  setShowPermissionDialog: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [pendingConnections, setPendingConnections] = useState<Map<string, any>>(new Map());

  // Handle peer connection
  const handlePeerConnect = useCallback(async (remotePeerId: string, peer: any) => {
    if (!peer) {
      toast.error("Peer connection is not established.");
      return;
    }

    if (pendingConnections.has(remotePeerId)) {
      toast.warning("Already attempting to connect to this peer.");
      return;
    }

    setTransferStatus({ ...transferStatus, active: true, status: 'pending', remotePeer: remotePeerId });
    toast.info(`Attempting to connect to peer: ${remotePeerId}`);

    try {
      const conn = peer.connect(remotePeerId, { reliable: true });
      pendingConnections.set(remotePeerId, conn);
      setPendingConnections(new Map(pendingConnections));

      conn.on('open', () => {
        toast.success(`Connection established with peer: ${remotePeerId}`);
        pendingConnections.delete(remotePeerId);
        setPendingConnections(new Map(pendingConnections));
      });

      conn.on('data', (data: any) => {
        if (typeof data === 'object' && data !== null && data.type === 'file-chunk') {
          // Unexpected data during initial connection, possibly from a previous session
          console.warn("Unexpected file-chunk data received:", data);
        } else if (typeof data === 'object' && data !== null && data.files) {
          // Handle file request
          console.log("Received file request from", remotePeerId, data.files);
          setPendingPermission({ conn: conn, files: currentFiles });
          setShowPermissionDialog(true);
        } else {
          console.log("Received data", data);
        }
      });

      conn.on('close', () => {
        pendingConnections.delete(remotePeerId);
        setPendingConnections(new Map(pendingConnections));
        setTransferStatus({ ...transferStatus, active: false });
        toast.info(`Connection with ${remotePeerId} closed.`);
      });

      conn.on('error', (err: any) => {
        pendingConnections.delete(remotePeerId);
        setPendingConnections(new Map(pendingConnections));
        setTransferStatus({ ...transferStatus, active: false });
        console.error("Connection error:", err);
        toast.error(`Connection error with ${remotePeerId}: ${err.message}`);
      });
    } catch (error: any) {
      pendingConnections.delete(remotePeerId);
      setPendingConnections(new Map(pendingConnections));
      setTransferStatus({ ...transferStatus, active: false });
      console.error("Failed to connect to peer:", error);
      toast.error(`Failed to connect to peer ${remotePeerId}: ${error.message}`);
    }
  }, [currentFiles, pendingConnections, setShowPermissionDialog, setPendingPermission, setTransferStatus, transferStatus]);

  return {
    pendingConnections,
    setPendingConnections,
    handlePeerConnect
  };
};
