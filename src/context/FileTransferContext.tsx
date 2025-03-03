
import React, { createContext, useContext, ReactNode } from "react";
import { useFileTransferState } from "../hooks/useFileTransferState";
import { FileTransferContextType } from "../types/fileTransfer.types";

// Create the context
const FileTransferContext = createContext<FileTransferContextType>({} as FileTransferContextType);

// Export hook for using the file transfer context
export const useFileTransfer = () => useContext(FileTransferContext);

interface FileTransferProviderProps {
  children: ReactNode;
}

export const FileTransferProvider: React.FC<FileTransferProviderProps> = ({ children }) => {
  // Use the hook to get all the file transfer state and methods
  const fileTransferState = useFileTransferState();

  return (
    <FileTransferContext.Provider value={fileTransferState}>
      {children}
    </FileTransferContext.Provider>
  );
};
