
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { usePeer } from "../context/PeerContext";
import { generatePeerId } from "../utils/peer.utils";
import { processDirectoryEntry, validateFiles, downloadFile } from "../utils/fileTransfer.utils";
import { TransferStatus, PendingPermission, MAX_FILE_SIZE, CHUNK_SIZE } from "../types/fileTransfer.types";
import { FileSystemEntry } from 'react-dropzone';

export const useFileTransferState = () => {
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

  // Setup connection handlers whenever the peer changes
  useEffect(() => {
    if (peer && currentFiles.length > 0) {
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
            setPendingPermission({ conn, files: currentFiles });
            setShowPermissionDialog(true);
            toast.info(`File request from ${conn.peer}`);
          }
        });

        conn.on('error', (error) => {
          console.error('Connection error:', error);
          toast.error("Connection error occurred");
        });
      });
    }
  }, [peer, currentFiles]);

  // Handle directory selection
  const handleDirectorySelect = async (entries: FileSystemEntry[]) => {
    let allFiles: File[] = [];
    
    for (const entry of entries) {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        await new Promise<void>((resolve) => {
          fileEntry.file((file) => {
            // Add path info to the file
            const fileWithPath = Object.defineProperty(file, 'path', {
              value: fileEntry.fullPath,
              writable: true
            });
            allFiles.push(fileWithPath);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirFiles = await processDirectoryEntry(entry as FileSystemDirectoryEntry);
        allFiles = [...allFiles, ...dirFiles];
      }
    }
    
    // Use the existing handleFileSelect function with the collected files
    handleFileSelect(allFiles);
  };

  // Handle file selection and set up peer for sharing
  const handleFileSelect = (files: File[]) => {
    // Validate files
    const validFiles = validateFiles(files);
    if (validFiles.length === 0) {
      return;
    }
    
    setCurrentFiles(validFiles);
    
    // Generate a new peer ID if needed
    const newPeerId = peerId || generatePeerId();
    
    // Create a new peer for file sharing if needed
    if (!peer) {
      createNewPeer(newPeerId);
    }
    
    toast.success(`Files ready to share! Your token is: ${newPeerId || 'loading...'}`);
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
        // Send file list first with path information
        const fileList = files.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          path: (file as any).path || `/${file.name}` // Default to root if no path
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
          
          // Send in chunks 
          const totalChunks = Math.ceil(buffer.byteLength / CHUNK_SIZE);
          
          // Send file info first
          conn.send({
            type: 'file-info',
            fileIndex: i,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            filePath: (file as any).path || `/${file.name}`,
            totalChunks: totalChunks,
            totalFiles: files.length
          });
          
          // Send file data in chunks
          for (let chunk = 0; chunk < totalChunks; chunk++) {
            const start = chunk * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, buffer.byteLength);
            const chunkData = buffer.slice(start, end);
            
            conn.send({
              type: 'file-chunk',
              fileIndex: i,
              chunkIndex: chunk,
              totalChunks: totalChunks,
              data: chunkData
            });
            
            // Update progress every 10 chunks
            if (chunk % 10 === 0 || chunk === totalChunks - 1) {
              const fileProgress = Math.round((chunk + 1) / totalChunks * 100);
              const overallProgress = Math.round((i / files.length * 100) + (fileProgress / files.length));
              
              conn.send({
                type: 'progress-update',
                fileIndex: i, 
                fileName: file.name,
                currentChunk: chunk + 1,
                totalChunks: totalChunks,
                fileProgress: fileProgress,
                overallProgress: overallProgress
              });
            }
            
            // Small delay to prevent overwhelming the connection
            await new Promise(resolve => setTimeout(resolve, 5));
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
      
      // If connection fails
      setTimeout(() => {
        if (conn.open === false && transferStatus.status === 'pending') {
          toast.error(`Connection to ${remotePeerId} failed. Please check the token and try again.`);
          setTransferStatus({
            active: true,
            status: 'error',
            progress: 0,
            remotePeer: remotePeerId
          });
        }
      }, 15000); // 15 seconds timeout
      
      let receivingFiles: Map<number, {
        name: string,
        type: string,
        size: number,
        path: string,
        chunks: Map<number, ArrayBuffer>,
        totalChunks: number
      }> = new Map();
      
      let completedFiles: Array<{
        index: number, 
        blob: Blob,
        name: string,
        path: string
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
            path: data.filePath || `/${data.fileName}`,
            chunks: new Map(),
            totalChunks: data.totalChunks
          });
        }
        else if (data.type === 'file-chunk') {
          try {
            const { fileIndex, chunkIndex, totalChunks, data: chunkData } = data;
            
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
                name: fileInfo.name,
                path: fileInfo.path
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
        else if (data.type === 'progress-update') {
          // Update UI with progress information
          setTransferStatus(prev => ({
            ...prev,
            status: 'transferring',
            progress: data.overallProgress,
            remotePeer: remotePeerId
          }));
        }
        else if (data.type === 'transfer-complete') {
          // Process and download all files
          completedFiles.sort((a, b) => a.index - b.index);
          
          // Group files by directory
          const directories: Map<string, {blob: Blob, name: string}[]> = new Map();
          
          completedFiles.forEach(file => {
            // Extract directory path
            const pathParts = file.path.split('/');
            pathParts.pop(); // Remove filename
            const dirPath = pathParts.join('/') || '/';
            
            if (!directories.has(dirPath)) {
              directories.set(dirPath, []);
            }
            
            directories.get(dirPath)?.push({
              blob: file.blob,
              name: file.name
            });
          });
          
          // Download files by directory
          directories.forEach((files, dirPath) => {
            if (files.length === 1 && dirPath === '/') {
              // Single file at root, download directly
              const file = files[0];
              downloadFile(file.blob, file.name);
            } else {
              // Multiple files or directory structure
              // For browsers that support the File System Access API
              if ('showDirectoryPicker' in window) {
                // Let the user download files individually for now
                files.forEach(file => {
                  downloadFile(file.blob, file.name);
                });
              } else {
                // Fallback for browsers without directory support
                files.forEach(file => {
                  downloadFile(file.blob, file.name);
                });
              }
            }
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
    handleDirectorySelect
  };
};
