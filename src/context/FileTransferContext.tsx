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
    const newPeerId = peerId || generatePeerId();
    
    // Create a new peer for file sharing
    createNewPeer(newPeerId);
    
    // Set up connection handlers
    if (peer) {
      peer.on('connection', (conn) => {
        console.log('New connection in handleFileSelect:', conn.peer);
        
        conn.on('data', async (data: any) => {
          console.log('Received data in handleFileSelect:', data);
          
          if (data.type === 'request-permission') {
            setPendingPermission({ conn, files });
            setShowPermissionDialog(true);
          }
        });

        conn.on('error', (error) => {
          console.error('Connection error:', error);
          toast.error("Connection error occurred");
        });
      });
    }
    
    toast.success(`Files ready to share! Your token is: ${newPeerId}`);
  };

  // Handle permission response (approve/deny file sharing)
  const handlePermissionResponse = async (isApproved: boolean) => {
    const { conn, files } = pendingPermission;
    
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
        
        // Send each file individually
        for(let i = 0; i < files.length; i++) {
          const file = files[i];
          const buffer = await file.arrayBuffer();
          conn.send({
            type: 'file-data',
            fileIndex: i,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: buffer,
            totalFiles: files.length
          });
          
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
    if (!peer || !remotePeerId) {
      toast.error("Connection not ready. Please try again.");
      return;
    }

    try {
      console.log('Connecting to peer:', remotePeerId);
      const conn = peer.connect(remotePeerId);
      
      // Update UI to show pending request
      setTransferStatus({
        active: true,
        status: 'pending',
        progress: 0,
        remotePeer: remotePeerId
      });
      
      conn.on('open', () => {
        console.log('Connection opened to:', remotePeerId);
        toast.info("Requesting permission from sender...");
        conn.send({ type: 'request-permission' });
      });

      let receivedFiles: Array<{
        index: number, 
        blob: Blob,
        name: string
      }> = [];
      let fileList: Array<{name: string, type: string, size: number}> = [];
      let totalFiles = 0;
      
      conn.on('data', (data: any) => {
        console.log('Received data in receiver:', data);
        
        if (data.type === 'permission-granted') {
          setTransferStatus({
            active: true,
            status: 'granted',
            progress: 0,
            remotePeer: remotePeerId
          });
          
          totalFiles = data.fileCount;
          fileList = data.fileList;
          
          toast.success("Permission granted. Starting file transfer...");
        } 
        else if (data.type === 'file-data') {
          try {
            const { fileIndex, fileData, fileName, fileType, totalFiles } = data;
            
            // Convert ArrayBuffer to Blob with the correct file type
            const blob = new Blob([fileData], { type: fileType || 'application/octet-stream' });
            
            // Store the file data
            receivedFiles.push({
              index: fileIndex,
              blob,
              name: fileName
            });
            
            // Update progress
            const progress = Math.round((receivedFiles.length / totalFiles) * 100);
            setTransferStatus({
              active: true,
              status: 'transferring',
              progress,
              remotePeer: remotePeerId
            });
            
            toast.success(`Received ${fileName} (${fileIndex+1}/${totalFiles})`);
          } catch (error) {
            console.error('Error processing file data:', error);
            toast.error("Error processing file data");
          }
        }
        else if (data.type === 'transfer-complete') {
          // Process and download all files
          receivedFiles.sort((a, b) => a.index - b.index);
          
          receivedFiles.forEach(file => {
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
