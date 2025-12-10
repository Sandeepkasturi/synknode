import { useState, useCallback } from "react";
import Peer, { DataConnection } from "peerjs";
import { toast } from "sonner";
import { generatePeerId } from "../utils/peer.utils";
import { CHUNK_SIZE } from "../types/fileTransfer.types";

const STATIC_RECEIVER_CODE = "SRGEC";

interface TransferProgress {
  active: boolean;
  progress: number;
  status: 'idle' | 'connecting' | 'transferring' | 'completed' | 'error';
  currentFile?: string;
}

export const useSenderPeer = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [senderName, setSenderName] = useState<string>(() => {
    return localStorage.getItem('sender_name') || '';
  });
  const [transferProgress, setTransferProgress] = useState<TransferProgress>({
    active: false,
    progress: 0,
    status: 'idle'
  });

  const updateSenderName = useCallback((name: string) => {
    setSenderName(name);
    localStorage.setItem('sender_name', name);
  }, []);

  const sendFiles = useCallback(async (files: File[], name: string) => {
    if (!name.trim()) {
      toast.error("Please enter your name first");
      return;
    }

    updateSenderName(name);

    // Create a new peer for this transfer
    const newPeerId = generatePeerId();
    
    const newPeer = new Peer(newPeerId, {
      debug: 2,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ]
      }
    });

    return new Promise<void>((resolve, reject) => {
      newPeer.on('open', async () => {
        console.log('Sender peer connected, connecting to receiver...');
        setIsConnected(true);
        setPeer(newPeer);

        setTransferProgress({
          active: true,
          progress: 0,
          status: 'connecting'
        });

        try {
          const conn = newPeer.connect(STATIC_RECEIVER_CODE, {
            reliable: true,
            serialization: 'binary'
          });

          // Connection timeout
          const timeout = setTimeout(() => {
            if (!conn.open) {
              toast.error("Connection timeout. Receiver may not be available.");
              setTransferProgress({ active: false, progress: 0, status: 'error' });
              newPeer.destroy();
              reject(new Error('Connection timeout'));
            }
          }, 15000);

          conn.on('open', async () => {
            clearTimeout(timeout);
            console.log('Connected to receiver, starting transfer...');
            
            // Send sender info first
            conn.send({
              type: 'sender-info',
              name: name.trim()
            });

            setTransferProgress({
              active: true,
              progress: 0,
              status: 'transferring'
            });

            try {
              await transferFiles(conn, files, (progress, fileName) => {
                setTransferProgress({
                  active: true,
                  progress,
                  status: 'transferring',
                  currentFile: fileName
                });
              });

              // Signal completion
              conn.send({ type: 'transfer-complete' });

              setTransferProgress({
                active: true,
                progress: 100,
                status: 'completed'
              });

              toast.success("Files sent successfully!");

              // Clean up after delay
              setTimeout(() => {
                setTransferProgress({ active: false, progress: 0, status: 'idle' });
                newPeer.destroy();
                setPeer(null);
                setIsConnected(false);
              }, 3000);

              resolve();
            } catch (error) {
              console.error('Transfer error:', error);
              toast.error("Error during file transfer");
              setTransferProgress({ active: false, progress: 0, status: 'error' });
              reject(error);
            }
          });

          conn.on('error', (error) => {
            clearTimeout(timeout);
            console.error('Connection error:', error);
            toast.error("Failed to connect to receiver");
            setTransferProgress({ active: false, progress: 0, status: 'error' });
            newPeer.destroy();
            reject(error);
          });

        } catch (error) {
          console.error('Error connecting:', error);
          toast.error("Connection failed");
          setTransferProgress({ active: false, progress: 0, status: 'error' });
          newPeer.destroy();
          reject(error);
        }
      });

      newPeer.on('error', (error) => {
        console.error('Peer error:', error);
        toast.error("Connection error");
        setTransferProgress({ active: false, progress: 0, status: 'error' });
        reject(error);
      });
    });
  }, [updateSenderName]);

  const transferFiles = async (
    conn: DataConnection, 
    files: File[], 
    onProgress: (progress: number, fileName: string) => void
  ) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = await file.arrayBuffer();
      const totalChunks = Math.ceil(buffer.byteLength / CHUNK_SIZE);

      // Send file info
      conn.send({
        type: 'file-info',
        fileIndex: i,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        totalChunks,
        totalFiles: files.length
      });

      // Send chunks
      for (let chunk = 0; chunk < totalChunks; chunk++) {
        const start = chunk * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, buffer.byteLength);
        const chunkData = buffer.slice(start, end);

        conn.send({
          type: 'file-chunk',
          fileIndex: i,
          chunkIndex: chunk,
          totalChunks,
          data: chunkData
        });

        // Calculate overall progress
        const fileProgress = (chunk + 1) / totalChunks;
        const overallProgress = ((i + fileProgress) / files.length) * 100;
        onProgress(Math.round(overallProgress), file.name);

        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 2));
      }
    }
  };

  return {
    isConnected,
    senderName,
    updateSenderName,
    sendFiles,
    transferProgress
  };
};
