
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PendingPermission, TransferStatus } from "../../types/fileTransfer.types";
import { useFileTransfer } from "./useFileTransfer";

export const useFilePermissions = (transferStatus: TransferStatus, setTransferStatus: React.Dispatch<React.SetStateAction<TransferStatus>>) => {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [pendingPermission, setPendingPermission] = useState<PendingPermission>({
    conn: null,
    files: [],
  });
  
  const { sendFile } = useFileTransfer(transferStatus, setTransferStatus);

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
  }, [transferStatus, pendingPermission, sendFile, setTransferStatus]);

  return {
    showPermissionDialog,
    setShowPermissionDialog,
    pendingPermission,
    setPendingPermission,
    handlePermissionResponse
  };
};
