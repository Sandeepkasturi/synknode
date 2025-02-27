
import React, { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { usePeer } from "./PeerContext";
import { generatePeerId } from "./PeerContext";

interface TransferStatus {
  active: boolean;
  status: 'pending' | 'granted' | 'denied' | 'transferring' | 'completed' | 'error';
  progress: number;
  remotePeer: string;
}

interface PendingPermission {
  conn: any; 
  files: File[];
}

interface FileTransferContextType {
  currentFiles: File[];
  setCurrentFiles: React.Dispatch<React.SetStateAction<File[]>>;
  pendingConnections: Map<string, any>;
  setPendingConnections: React.Dispatch<React.SetStateAction<Map<string, any>>>;
  transferStatus: TransferStatus;
  setTransferStatus: React.Dispatch<React.SetStateAction<TransferStatus>>;
  showPermissionDialog: boolean;
  setShowPermissionDialog: React.Dispatch<React.SetStateAction<boolean>>;
  pendingPermission: PendingPermission;
  setPendingPermission: React.Dispatch<React.SetStateAction<PendingPermission>>;
  handleFileSelect: (files: File[]) => void;
  handlePermissionResponse: (isApproved: boolean) => Promise<void>;
  handlePeerConnect: (remotePeerId: string) => Promise<void>;
}

const FileTransferContext = createContext<FileTransferContextType>({} as FileTransferContextType);

export const useFileTransfer = () => useContext(FileTransferContext);

interface FileTransferProviderProps {
  children: ReactNode;
}

export const FileTransferProvider: React.FC<FileTransferProviderProps> = ({ children }) => {
  const { peer, createNewPeer, peerId } = usePeer();
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Map<string, any>>(new Map());
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [pendingPermission, setPendingPermission] = useState<PendingPermission>({ conn: null, files: [] });
  const [transferStatus, setTransferStatus] = useState<TransferStatus>({
    active: false,
    status: 'pending',
    progress: 0,
    remotePeer: '',
  });

  // Handle file selection and set up peer for sharing
  const handleFileSelect = (files: File[]) => {
    setCurrentFiles(files);
    
    // Generate a new peer ID if needed
    const newPeerId = peerId || generatePeerId();
    
    // Create a new peer for file sharing
    createNewPeer(newPeerId);
    
    // Set up connection handlers for the peer
    if (peer) {
      console.log("Setting up connection handlers for peer", peer.id);
      
      // Remove any existing listeners to prevent duplicates
      peer.removeAllListeners('connection');
      
      // Add new connection listener
      peer.on('connection', (conn) => {
        console.log('New connection received from:', conn.peer);
        
        conn.on('open', () => {
          console.log('Connection opened with:', conn.peer);
        });
        
        conn.on('data', async (data: any) => {
          console.log('Received data in sender:', data);
          
          if (data.type === 'request-permission') {
            console.log('Permission requested by:', conn.peer);
            setPendingPermission({ conn, files });
            setShowPermissionDialog(true);
            toast.info(`File request from ${conn.peer}`);
          }
        });

        conn.on('error', (error) => {
          console.error('Connection error:', error);
          toast.error("Connection error occurred");
        });
      });
    } else {
      console.warn("Peer not available for setting up connection handlers");
    }
    
    toast.success(`Files ready to share! Your token is: ${newPeerId}`);
  };

  // Handle permission response (approve/deny file sharing)
  const handlePermissionResponse = async (isApproved: boolean) => {
    const { conn, files } = pendingPermission;
    
    if (!conn) {
      console.error("No connection found for permission response");
      toast.error("Connection error");
      setShowPermissionDialog(false);
      return;
    }
    
    console.log(`Permission ${isApproved ? 'granted' : 'denied'} for ${conn.peer}`);
    
    if (isApproved && files.length > 0) {
      try {
        // Send file list first
        const fileList = files.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified
        }));
        
        conn.send({
          type: 'permission-granted',
          fileCount: files.length,
          fileList: fileList
        });
        
        toast.success(`Starting transfer to ${conn.peer}...`);
        
        // Send each file individually
        for(let i = 0; i < files.length; i++) {
          const file = files[i];
          const buffer = await file.arrayBuffer();
          
          // Send in chunks if the file is large
          const chunkSize = 16384; // 16KB chunks
          const totalChunks = Math.ceil(buffer.byteLength / chunkSize);
          
          // Send file info first
          conn.send({
            type: 'file-info',
            fileIndex: i,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            totalChunks: totalChunks,
            totalFiles: files.length
          });
          
          // Send file data in chunks
          for (let chunk = 0; chunk < totalChunks; chunk++) {
            const start = chunk * chunkSize;
            const end = Math.min(start + chunkSize, buffer.byteLength);
            const chunkData = buffer.slice(start, end);
            
            conn.send({
              type: 'file-chunk',
              fileIndex: i,
              chunkIndex: chunk,
              totalChunks: totalChunks,
              data: chunkData
            });
            
            // Small delay to prevent overwhelming the connection
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          
          toast.success(`Sending ${file.name} (${i+1}/${files.length})`);
        }
        
        // Signal completion
        conn.send({
          type: 'transfer-complete'
        });
        
        toast.success(`Granted access to ${conn.peer}`);
      } catch (error) {
        console.error('Error sending files:', error);
        toast.error("Error sending files");
        conn.send({
          type: 'transfer-error',
          message: 'Error sending files'
        });
      }
    } else {
      conn.send({
        type: 'permission-denied'
      });
      toast.info(`Denied access to ${conn.peer}`);
    }
    
    setShowPermissionDialog(false);
    setPendingPermission({ conn: null, files: [] });
  };

  // Connect to peer and request files
  const handlePeerConnect = async (remotePeerId: string) => {
    if (!peer) {
      toast.error("Connection not ready. Please try again.");
      return;
    }

    // Normalize the peer ID to uppercase
    remotePeerId = remotePeerId.toUpperCase();
    
    if (remotePeerId === peerId) {
      toast.error("You cannot connect to yourself");
      return;
    }

    try {
      console.log('Connecting to peer:', remotePeerId);
      
      // Update UI to show pending request
      setTransferStatus({
        active: true,
        status: 'pending',
        progress: 0,
        remotePeer: remotePeerId
      });
      
      // Create connection with reliable data channel
      const conn = peer.connect(remotePeerId, {
        reliable: true,
        serialization: 'binary'
      });
      
      let receivingFiles: Map<number, {
        name: string,
        type: string,
        size: number,
        chunks: Map<number, ArrayBuffer>,
        totalChunks: number
      }> = new Map();
      
      let completedFiles: Array<{
        index: number, 
        blob: Blob,
        name: string
      }> = [];
      
      conn.on('open', () => {
        console.log('Connection opened to:', remotePeerId);
        toast.info("Requesting permission from sender...");
        conn.send({ type: 'request-permission' });
      });

      conn.on('data', (data: any) => {
        console.log('Received data in receiver:', data.type);
        
        if (data.type === 'permission-granted') {
          setTransferStatus({
            active: true,
            status: 'granted',
            progress: 0,
            remotePeer: remotePeerId
          });
          
          toast.success("Permission granted. Starting file transfer...");
        } 
        else if (data.type === 'file-info') {
          // Initialize file structure for receiving chunks
          receivingFiles.set(data.fileIndex, {
            name: data.fileName,
            type: data.fileType,
            size: data.fileSize,
            chunks: new Map(),
            totalChunks: data.totalChunks
          });
        }
        else if (data.type === 'file-chunk') {
          try {
            const { fileIndex, chunkIndex, data: chunkData } = data;
            
            // Get file info
            const fileInfo = receivingFiles.get(fileIndex);
            if (!fileInfo) return;
            
            // Store the chunk
            fileInfo.chunks.set(chunkIndex, chunkData);
            
            // Check if file is complete
            if (fileInfo.chunks.size === fileInfo.totalChunks) {
              // Combine all chunks
              const fileData = new Uint8Array(fileInfo.size);
              let offset = 0;
              
              for (let i = 0; i < fileInfo.totalChunks; i++) {
                const chunk = fileInfo.chunks.get(i);
                if (!chunk) continue;
                
                const chunkView = new Uint8Array(chunk);
                fileData.set(chunkView, offset);
                offset += chunkView.length;
              }
              
              // Create blob
              const blob = new Blob([fileData], { type: fileInfo.type || 'application/octet-stream' });
              
              // Add to completed files
              completedFiles.push({
                index: fileIndex,
                blob,
                name: fileInfo.name
              });
              
              // Clear from receiving files to free memory
              receivingFiles.delete(fileIndex);
              
              // Update progress
              const progress = Math.round((completedFiles.length / data.totalFiles) * 100);
              setTransferStatus({
                active: true,
                status: 'transferring',
                progress,
                remotePeer: remotePeerId
              });
              
              toast.success(`Received ${fileInfo.name}`);
            }
          } catch (error) {
            console.error('Error processing file chunk:', error);
            toast.error("Error processing file data");
          }
        }
        else if (data.type === 'transfer-complete') {
          // Process and download all files
          completedFiles.sort((a, b) => a.index - b.index);
          
          completedFiles.forEach(file => {
            const url = URL.createObjectURL(file.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });
          
          setTransferStatus({
            active: true,
            status: 'completed',
            progress: 100,
            remotePeer: remotePeerId
          });
          
          toast.success("All files downloaded successfully!");
          
          // Reset after a delay
          setTimeout(() => {
            setTransferStatus({
              active: false,
              status: 'pending',
              progress: 0,
              remotePeer: ''
            });
          }, 5000);
        }
        else if (data.type === 'permission-denied') {
          setTransferStatus({
            active: true,
            status: 'denied',
            progress: 0,
            remotePeer: remotePeerId
          });
          
          toast.error("File access denied by sender");
          
          // Reset after a delay
          setTimeout(() => {
            setTransferStatus({
              active: false,
              status: 'pending',
              progress: 0,
              remotePeer: ''
            });
          }, 5000);
        }
        else if (data.type === 'transfer-error') {
          setTransferStatus({
            active: true,
            status: 'error',
            progress: 0,
            remotePeer: remotePeerId
          });
          
          toast.error("Error during file transfer");
          
          // Reset after a delay
          setTimeout(() => {
            setTransferStatus({
              active: false,
              status: 'pending',
              progress: 0,
              remotePeer: ''
            });
          }, 5000);
        }
      });

      conn.on('error', (error) => {
        console.error('Connection error:', error);
        toast.error("Failed to connect to peer");
        
        setTransferStatus({
          active: true,
          status: 'error',
          progress: 0,
          remotePeer: remotePeerId
        });
      });

      setPendingConnections(prev => new Map(prev.set(remotePeerId, conn)));
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.error("Failed to connect to peer");
      
      setTransferStatus({
        active: true,
        status: 'error',
        progress: 0,
        remotePeer: remotePeerId
      });
    }
  };

  return (
    <FileTransferContext.Provider
      value={{
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
      }}
    >
      {children}
    </FileTransferContext.Provider>
  );
};
