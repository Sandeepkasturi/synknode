
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePeer } from "./PeerContext";
import { toast } from "sonner";
import { generateSixDigitCode } from "../utils/codeGenerator";

interface AirShareContextType {
  // Connection state
  connectCode: string | null;
  isConnected: boolean;
  connectedPeerId: string | null;
  isHost: boolean;
  
  // File preview state
  previewFiles: File[];
  previewUrls: string[];
  isReceivingFile: boolean;
  
  // Actions
  generateNewCode: () => void;
  connectWithCode: (code: string) => Promise<boolean>;
  uploadFiles: (files: File[]) => void;
  clearFiles: () => void;
}

const AirShareContext = createContext<AirShareContextType>({} as AirShareContextType);

export const useAirShare = () => useContext(AirShareContext);

interface AirShareProviderProps {
  children: ReactNode;
}

export const AirShareProvider: React.FC<AirShareProviderProps> = ({ children }) => {
  // Connection state
  const [connectCode, setConnectCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPeerId, setConnectedPeerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  
  // File preview state
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isReceivingFile, setIsReceivingFile] = useState(false);
  
  // Get peer functionality
  const { peer, createNewPeer, peerId } = usePeer();

  // Generate new 6-digit connection code
  const generateNewCode = () => {
    const newCode = generateSixDigitCode();
    setConnectCode(newCode);
    setIsHost(true);
    
    if (peer) {
      // Use the code as our peer ID, making it easy for others to connect
      createNewPeer(newCode);
    }
    
    toast.success(`Your connection code is: ${newCode}`);
    return newCode;
  };

  // Connect to another peer using their code
  const connectWithCode = async (code: string): Promise<boolean> => {
    if (!peer) {
      toast.error("Connection not ready. Please try again.");
      return false;
    }
    
    try {
      // First ensure we have our own peer ID
      if (!peerId) {
        await new Promise((resolve) => {
          createNewPeer();
          // Wait for peer creation
          setTimeout(resolve, 1000);
        });
      }
      
      // The connection code is the remote peer's ID
      const conn = peer.connect(code, {
        reliable: true,
        serialization: 'binary'
      });
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          toast.error("Connection timed out. Please check the code and try again.");
          resolve(false);
        }, 10000);
        
        conn.on('open', () => {
          clearTimeout(timeout);
          setConnectedPeerId(code);
          setIsConnected(true);
          setIsHost(false);
          
          // Send our info to the host
          conn.send({
            type: 'connected',
            peerId: peerId
          });
          
          // Set up data listener for this connection
          setupConnectionListeners(conn);
          
          toast.success("Connected successfully!");
          resolve(true);
        });
        
        conn.on('error', (err) => {
          clearTimeout(timeout);
          console.error("Connection error:", err);
          toast.error("Failed to connect. Please check the code and try again.");
          resolve(false);
        });
      });
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect. Please check the code and try again.");
      return false;
    }
  };

  // Process and upload files
  const uploadFiles = (files: File[]) => {
    if (!isConnected || !connectedPeerId) {
      toast.error("Not connected to another device");
      return;
    }

    // Generate preview URLs for local display
    const urls: string[] = [];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      urls.push(url);
    }
    
    setPreviewFiles(files);
    setPreviewUrls(urls);
    
    // Send files to the connected peer
    sendFilesToPeer(files, connectedPeerId);
  };
  
  // Clear all files
  const clearFiles = () => {
    // Revoke object URLs to prevent memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewFiles([]);
    setPreviewUrls([]);
  };
  
  // Function to send files to peer
  const sendFilesToPeer = async (files: File[], remotePeerId: string) => {
    if (!peer) return;
    
    try {
      const conn = peer.connect(remotePeerId);
      
      conn.on('open', async () => {
        // Send metadata first
        const fileMetadata = files.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        }));
        
        conn.send({
          type: 'file-preview-start',
          files: fileMetadata
        });
        
        // Process and send each file
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();
          
          // Read file as data URL for preview
          await new Promise<void>((resolve) => {
            reader.onloadend = () => {
              if (reader.result) {
                conn.send({
                  type: 'file-preview-data',
                  index: i,
                  name: file.name,
                  data: reader.result,
                  mimeType: file.type
                });
                resolve();
              }
            };
            reader.readAsDataURL(file);
          });
        }
        
        conn.send({
          type: 'file-preview-complete'
        });
        
        toast.success("Files shared for preview!");
      });
      
      conn.on('error', (error) => {
        console.error("Error sending files:", error);
        toast.error("Failed to send files for preview");
      });
    } catch (error) {
      console.error("Error connecting to peer:", error);
      toast.error("Failed to connect to the other device");
    }
  };
  
  // Set up listeners for incoming data
  const setupConnectionListeners = (conn: any) => {
    conn.on('data', (data: any) => {
      if (data.type === 'connected') {
        // Another peer connected to us
        setConnectedPeerId(data.peerId);
        setIsConnected(true);
        toast.success("Device connected successfully!");
      }
      else if (data.type === 'file-preview-start') {
        // Clear any existing files
        clearFiles();
        setIsReceivingFile(true);
        toast.info(`Receiving ${data.files.length} file(s) for preview...`);
      }
      else if (data.type === 'file-preview-data') {
        // Add preview URL to our state
        setPreviewUrls(prev => {
          const newUrls = [...prev];
          newUrls[data.index] = data.data; // data.data contains the Data URL
          return newUrls;
        });
        
        // Convert the Data URL back to a File object
        const byteString = atob(data.data.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
          int8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([int8Array], { type: data.mimeType });
        const file = new File([blob], data.name, { type: data.mimeType });
        
        setPreviewFiles(prev => {
          const newFiles = [...prev];
          newFiles[data.index] = file;
          return newFiles;
        });
      }
      else if (data.type === 'file-preview-complete') {
        setIsReceivingFile(false);
        toast.success("Files received for preview!");
      }
    });
  };
  
  // Set up peer connection listener
  useEffect(() => {
    if (peer && connectCode) {
      // Remove any existing listeners to prevent duplicates
      peer.removeAllListeners('connection');
      
      // Add new connection listener
      peer.on('connection', (conn) => {
        console.log('New AirShare connection received from:', conn.peer);
        
        conn.on('open', () => {
          // Setup listeners for this connection
          setupConnectionListeners(conn);
        });
      });
    }
  }, [peer, connectCode]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const value = {
    connectCode,
    isConnected,
    connectedPeerId,
    isHost,
    previewFiles,
    previewUrls,
    isReceivingFile,
    generateNewCode,
    connectWithCode,
    uploadFiles,
    clearFiles
  };

  return (
    <AirShareContext.Provider value={value}>
      {children}
    </AirShareContext.Provider>
  );
};
