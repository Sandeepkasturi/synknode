
import { useCallback } from "react";
import { toast } from "sonner";
import { TransferStatus, CHUNK_SIZE } from "../../types/fileTransfer.types";

export const useFileTransfer = (transferStatus: TransferStatus, setTransferStatus: React.Dispatch<React.SetStateAction<TransferStatus>>) => {
  // Send file implementation
  const sendFile = useCallback(async (conn: any, files: File[]) => {
    if (!conn) {
      toast.error("Peer connection is not established.");
      return;
    }

    if (!files || files.length === 0) {
      toast.error("No files selected for transfer.");
      return;
    }

    try {
      setTransferStatus({ ...transferStatus, active: true, status: 'transferring', progress: 0, remotePeer: conn.peer });

      for (const file of files) {
        let offset = 0;
        while (offset < file.size) {
          const chunk = file.slice(offset, offset + CHUNK_SIZE);
          conn.send({
            type: 'file-chunk',
            name: file.name,
            size: file.size,
            data: chunk,
            offset: offset
          });
          offset += CHUNK_SIZE;
          const progress = Math.min(1, offset / file.size);
          setTransferStatus({ ...transferStatus, progress: progress });
          await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
        }
      }

      // Signal completion
      conn.send({ type: 'file-complete' });
      setTransferStatus({ ...transferStatus, status: 'completed', progress: 1 });
      toast.success("File transfer completed successfully!");
    } catch (error: any) {
      console.error("File transfer error:", error);
      setTransferStatus({ ...transferStatus, status: 'error' });
      toast.error("File transfer failed: " + error.message);
    }
  }, [transferStatus, setTransferStatus]);

  return {
    sendFile
  };
};
