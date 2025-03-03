
import { useState } from "react";
import { usePeer } from "../../context/PeerContext";
import { TransferStatus } from "../../types/fileTransfer.types";
import { useFileSelection } from "./useFileSelection";
import { useFilePermissions } from "./useFilePermissions";
import { usePeerConnection } from "./usePeerConnection";

export const useFileTransferState = () => {
  const [transferStatus, setTransferStatus] = useState<TransferStatus>({
    active: false,
    status: 'pending',
    progress: 0,
    remotePeer: '',
  });
  
  const { peer } = usePeer();
  
  // Use our smaller, more focused hooks
  const { 
    currentFiles, 
    setCurrentFiles, 
    handleFileSelect, 
    handleDirectorySelect 
  } = useFileSelection();
  
  const { 
    showPermissionDialog, 
    setShowPermissionDialog, 
    pendingPermission, 
    setPendingPermission, 
    handlePermissionResponse 
  } = useFilePermissions(transferStatus, setTransferStatus);
  
  const { 
    pendingConnections, 
    setPendingConnections, 
    handlePeerConnect: handlePeerConnectBase 
  } = usePeerConnection(
    transferStatus, 
    setTransferStatus, 
    currentFiles, 
    setPendingPermission, 
    setShowPermissionDialog
  );

  // Wrapper for handlePeerConnect to provide the peer
  const handlePeerConnect = (remotePeerId: string) => {
    return handlePeerConnectBase(remotePeerId, peer);
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
    handleDirectorySelect,
  };
};
