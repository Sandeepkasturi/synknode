import { useState, useCallback, useRef } from "react";
import Peer, { DataConnection } from "peerjs";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";
import { QueueFile } from "../types/queue.types";

const STATIC_RECEIVER_CODE = "SRGEC";

export const useReceiverPeer = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReceiver, setIsReceiver] = useState(false);
  const { user } = useAuth();
  const { addToQueue } = useQueue();
  
  // Use ref to avoid stale closure issues
  const addToQueueRef = useRef(addToQueue);
  addToQueueRef.current = addToQueue;

  const handleSenderConnection = useCallback((conn: DataConnection) => {
    let senderName = "Unknown";
    let receivingFiles: Map<number, {
      name: string;
      type: string;
      size: number;
      chunks: Map<number, ArrayBuffer>;
      totalChunks: number;
    }> = new Map();
    let completedFiles: QueueFile[] = [];

    conn.on('open', () => {
      console.log('Connection opened with sender:', conn.peer);
    });

    conn.on('data', (data: any) => {
      console.log('Received data from sender:', data.type);

      if (data.type === 'sender-info') {
        senderName = data.name || "Unknown";
        console.log('Sender identified as:', senderName);
      }
      else if (data.type === 'file-info') {
        receivingFiles.set(data.fileIndex, {
          name: data.fileName,
          type: data.fileType,
          size: data.fileSize,
          chunks: new Map(),
          totalChunks: data.totalChunks
        });
      }
      else if (data.type === 'file-chunk') {
        const { fileIndex, chunkIndex, data: chunkData } = data;
        const fileInfo = receivingFiles.get(fileIndex);

        if (!fileInfo) return;

        fileInfo.chunks.set(chunkIndex, chunkData);

        // Check if file is complete
        if (fileInfo.chunks.size === fileInfo.totalChunks) {
          const fileData = new Uint8Array(fileInfo.size);
          let offset = 0;

          for (let i = 0; i < fileInfo.totalChunks; i++) {
            const chunk = fileInfo.chunks.get(i);
            if (!chunk) continue;
            const chunkView = new Uint8Array(chunk);
            fileData.set(chunkView, offset);
            offset += chunkView.length;
          }

          const blob = new Blob([fileData], { type: fileInfo.type || 'application/octet-stream' });

          completedFiles.push({
            name: fileInfo.name,
            size: fileInfo.size,
            type: fileInfo.type,
            blob
          });

          receivingFiles.delete(fileIndex);
        }
      }
      else if (data.type === 'transfer-complete') {
        // Add to queue with completed files
        if (completedFiles.length > 0) {
          addToQueueRef.current(senderName, completedFiles);
          toast.success(`${senderName} sent ${completedFiles.length} file(s)`);
        }

        // Reset state
        completedFiles = [];
        receivingFiles.clear();
      }
    });

    conn.on('error', (error) => {
      console.error('Connection error:', error);
      toast.error(`Connection error with ${senderName}`);
    });

    conn.on('close', () => {
      console.log('Connection closed with:', conn.peer);
    });
  }, []);

  const startReceiver = useCallback(async () => {
    if (!user) {
      toast.error("Please login to access receiver mode");
      return;
    }

    // User is already verified as authorized during login
    console.log("User authorized:", user.phone);

    if (peer) {
      peer.destroy();
    }

    console.log("Starting receiver with code:", STATIC_RECEIVER_CODE);

    const newPeer = new Peer(STATIC_RECEIVER_CODE, {
      debug: 2,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ]
      }
    });

    newPeer.on('open', (id) => {
      console.log('Receiver connected with ID:', id);
      setIsConnected(true);
      setIsReceiver(true);
      toast.success("Receiver mode active! Code: SRGEC");
    });

    newPeer.on('connection', (conn) => {
      console.log('New sender connection from:', conn.peer);
      handleSenderConnection(conn);
    });

    newPeer.on('error', (error) => {
      console.error('Receiver peer error:', error);
      if (error.type === 'unavailable-id') {
        toast.error("Receiver code SRGEC is already in use");
      } else {
        toast.error("Receiver connection error");
      }
      setIsConnected(false);
    });

    setPeer(newPeer);
  }, [user, peer, handleSenderConnection]);

  const stopReceiver = useCallback(() => {
    if (peer) {
      peer.destroy();
      setPeer(null);
      setIsConnected(false);
      setIsReceiver(false);
      toast.info("Receiver mode stopped");
    }
  }, [peer]);

  return {
    isConnected,
    isReceiver,
    startReceiver,
    stopReceiver,
    receiverCode: STATIC_RECEIVER_CODE
  };
};
