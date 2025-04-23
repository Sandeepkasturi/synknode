import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePeer } from "./PeerContext";
import { toast } from "sonner";
import { generateSixDigitCode, validateCode } from "../utils/codeGenerator";

interface AirShareContextType {
  // Connection state
  connectCode: string | null;
  isConnected: boolean;
  connectedPeerId: string | null;
  isHost: boolean;
  isConnecting: boolean;
  
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
  const [isConnecting, setIsConnecting] = useState(false);
  
  // File preview state
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isReceivingFile, setIsReceivingFile] = useState(false);
  
  // Get peer functionality
  const { peer, createNewPeer, peerId, destroyPeer, isConnected: isPeerConnected } = usePeer();

  // Generate new 6-digit connection code
  const generateNewCode = () => {
    // Only generate code if connected to P2P network
    if (!isPeerConnected) {
      toast.error("Please wait for P2P network connection");
      return;
    }

    // Destroy any existing connection
    destroyPeer();
    
    // Generate a new code
    const newCode = generateSixDigitCode();
    
    // Create new peer with the code as ID
    createNewPeer(newCode);
    
    setConnectCode(newCode);
    setIsHost(true);
    
    // Reset connection state
    setIsConnected(false);
    setConnectedPeerId(null);
    
    toast.success(`Your connection code is: ${newCode}`);
    return newCode;
  };

  // Connect to another peer using their code
  const connectWithCode = async (code: string): Promise<boolean> => {
    // Ensure P2P connection is established first
    if (!isPeerConnected) {
      toast.error("Please wait for P2P network connection");
      return false;
    }

    // Validate the code format
    if (!validateCode(code)) {
      toast.error("Please enter a valid 6-digit code");
      return false;
    }
    
    // Set connecting state
    setIsConnecting(true);
    
    try {
      // Destroy any previous peer connection
      destroyPeer();
      
      // Create a new peer for this connection
      await createNewPeer();
      
      // Wait for peer to be initialized
      let waitAttempts = 0;
      while (!peer && waitAttempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        waitAttempts++;
      }
      
      // If peer creation failed
      if (!peer) {
        toast.error("Connection initialization failed. Please try again.");
        setIsConnecting(false);
        return false;
      }
      
      // Connect to the remote peer using the code
      console.log("Connecting to remote peer with ID:", code);
      const conn = peer.connect(code, {
        reliable: true,
        serialization: 'binary'
      });
      
      // Set up timeout for connection attempt
      const connectionTimeout = setTimeout(() => {
        if (conn.open === false) {
          toast.error("Connection timed out. Please check the code and try again.");
          setIsConnecting(false);
        }
      }, 10000);
      
      // Return a promise that resolves when connection is established
      return new Promise((resolve) => {
        conn.on('open', () => {
          clearTimeout(connectionTimeout);
          
          console.log("Connection established with peer:", code);
          setConnectedPeerId(code);
          setIsConnected(true);
          setIsHost(false);
          setIsConnecting(false);
          
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
          clearTimeout(connectionTimeout);
          console.error("Connection error:", err);
          toast.error("Failed to connect. Please check the code and try again.");
          setIsConnecting(false);
          resolve(false);
        });
        
        conn.on('close', () => {
          console.log("Connection closed with peer:", code);
          setIsConnected(false);
          setConnectedPeerId(null);
        });
      });
      
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect. Please check the code and try again.");
      setIsConnecting(false);
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
      // Check if we're already connected to this peer
      let conn = peer.connections[remotePeerId]?.[0];
      
      // If not connected, establish a new connection
      if (!conn) {
        conn = peer.connect(remotePeerId);
        
        // Wait for connection to open
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Connection timeout")), 10000);
          
          conn.on('open', () => {
            clearTimeout(timeout);
            resolve();
          });
          
          conn.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
      }
      
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
      
      toast.success(`Starting file preview with ${remotePeerId}...`);
      
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
      
    } catch (error) {
      console.error("Error sending files:", error);
      toast.error("Failed to send files for preview");
    }
  };
  
  // Set up listeners for incoming data
  const setupConnectionListeners = (conn: any) => {
    // Remove any existing data listeners to prevent duplicates
    conn.removeAllListeners('data');
    
    conn.on('data', (data: any) => {
      console.log("Received data:", data.type);
      
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
    
    // Set up disconnection handler
    conn.on('close', () => {
      console.log("Connection closed");
      setIsConnected(false);
      setConnectedPeerId(null);
      toast.info("Device disconnected");
    });
  };
  
  // Set up peer connection listener when acting as host
  useEffect(() => {
    if (peer && connectCode) {
      // Remove any existing listeners to prevent duplicates
      peer.removeAllListeners('connection');
      
      // Add new connection listener
      peer.on('connection', (conn) => {
        console.log('New AirShare connection received from:', conn.peer);
        
        conn.on('open', () => {
          console.log("Connection opened with:", conn.peer);
          
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

  // Clean up connections on unmount
  useEffect(() => {
    return () => {
      if (peer) {
        destroyPeer();
      }
    };
  }, []);

  const value = {
    connectCode,
    isConnected,
    connectedPeerId,
    isHost,
    isConnecting,
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
