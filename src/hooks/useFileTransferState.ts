
import { useState, useCallback } from "react";
import { usePeer } from "../context/PeerContext";
import { toast } from "sonner";
import { 
  TransferStatus, 
  PendingPermission, 
  MAX_FILE_SIZE, 
  CHUNK_SIZE,
  FileSystemEntry
} from "../types/fileTransfer.types";

export const useFileTransferState = () => {
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Map<string, any>>(new Map());
  const [transferStatus, setTransferStatus] = useState<TransferStatus>({
    active: false,
    status: 'pending',
    progress: 0,
    remotePeer: '',
  });
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [pendingPermission, setPendingPermission] = useState<PendingPermission>({
    conn: null,
    files: [],
  });
  const { peer } = usePeer();

  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > MAX_FILE_SIZE) {
        toast.error("Total file size exceeds the maximum limit of 2GB.");
        return;
      }
      setCurrentFiles(files);
      toast.success(`${files.length} files selected`);
    }
  }, []);

  // Handle directory selection
  const handleDirectorySelect = useCallback(async (entries: FileSystemEntry[]) => {
    const files: File[] = [];

    async function processEntries(entries: FileSystemEntry[]) {
      for (const entry of entries) {
        if (entry.isFile) {
          await new Promise<void>((resolve) => {
            entry.file!(file => {
              if (file.size <= MAX_FILE_SIZE) {
                files.push(file);
              } else {
                toast.error(`File ${file.name} exceeds the maximum file size of 2GB.`);
              }
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          if (entry.createReader) {
            const reader = entry.createReader();
            await new Promise<void>((resolve) => {
              reader.readEntries(async (newEntries) => {
                await processEntries(newEntries);
                resolve();
              });
            });
          } else {
            console.warn("Directory entry does not have a createReader method:", entry);
          }
        }
      }
    }

    await processEntries(entries);

    if (files.length > 0) {
      setCurrentFiles(files);
      toast.success(`${files.length} files selected from directory`);
    } else {
      toast.info("No files found in the selected directory or files exceed the maximum size limit.");
    }
  }, []);

  // Handle permission response
  const handlePermissionResponse = useCallback(async (isApproved: boolean) => {
    setShowPermissionDialog(false);
    if (pendingPermission.conn) {
      if (isApproved) {
        setTransferStatus({ ...transferStatus, status: 'granted' });
        toast.success("Permission granted. Starting file transfer...");
        
        // Initiate the file transfer
        sendFile(pendingPermission.conn, pendingPermission.files);
      } else {
        setTransferStatus({ ...transferStatus, status: 'denied' });
        toast.warning("Permission denied. File transfer cancelled.");
      }
    }
  }, [transferStatus, pendingPermission]);

  // Send file implementation
  const sendFile = useCallback(async (conn: any, files: File[]) => {
    if (!peer) {
      toast.error("Peer connection is not established.");
      return;
    }

    if (!files || files.length === 0) {
      toast.error("No files selected for transfer.");
      return;
    }

    try {
      setTransferStatus({ ...transferStatus, active: true, status: 'transferring', progress: 0, remotePeer: conn.peer });

      for (const file of files) {
        let offset = 0;
        while (offset < file.size) {
          const chunk = file.slice(offset, offset + CHUNK_SIZE);
          conn.send({
            type: 'file-chunk',
            name: file.name,
            size: file.size,
            data: chunk,
            offset: offset
          });
          offset += CHUNK_SIZE;
          const progress = Math.min(1, offset / file.size);
          setTransferStatus({ ...transferStatus, progress: progress });
          await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
        }
      }

      // Signal completion
      conn.send({ type: 'file-complete' });
      setTransferStatus({ ...transferStatus, status: 'completed', progress: 1 });
      toast.success("File transfer completed successfully!");
    } catch (error: any) {
      console.error("File transfer error:", error);
      setTransferStatus({ ...transferStatus, status: 'error' });
      toast.error("File transfer failed: " + error.message);
    }
  }, [peer, transferStatus]);

  // Handle peer connection
  const handlePeerConnect = useCallback(async (remotePeerId: string) => {
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
  }, [peer, pendingConnections, transferStatus, currentFiles]);

  return {
    currentFiles,
    setCurrentFiles,
    pendingConnections,
    setPendingConnections,
    transferStatus,
    setTransferStatus,
    showPermissionDialog,
    setShowPermissionDialog,
    pendingPermission,
    setPendingPermission,
    handleFileSelect,
    handlePermissionResponse,
    handlePeerConnect,
    handleDirectorySelect,
  };
};
