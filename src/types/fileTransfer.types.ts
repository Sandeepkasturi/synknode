
// Remove react-dropzone import
import React from 'react';

// Transfer status type
export interface TransferStatus {
  active: boolean;
  status: 'pending' | 'granted' | 'denied' | 'transferring' | 'completed' | 'error';
  progress: number;
  remotePeer: string;
}

// Pending permission type
export interface PendingPermission {
  conn: any; 
  files: File[];
}

// Context type
export interface FileTransferContextType {
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

// Constants
export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
export const CHUNK_SIZE = 64 * 1024; // 64KB for better performance
