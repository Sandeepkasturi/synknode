
// FileSystemEntry from react-dropzone is not directly exported
// Using the correct type import pattern
import { FileRejection } from 'react-dropzone';

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

// We'll define our own FileSystemEntry interface since it's not exported from react-dropzone
export interface FileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  path?: string;
  file?: (callback: (file: File) => void) => void;
  createReader?: () => {
    readEntries: (callback: (entries: FileSystemEntry[]) => void) => void;
  };
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
  handleDirectorySelect: (entries: FileSystemEntry[]) => void;
}

// Constants
export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
export const CHUNK_SIZE = 64 * 1024; // 64KB for better performance
