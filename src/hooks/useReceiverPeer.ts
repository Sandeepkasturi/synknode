import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";
import { supabase } from "@/integrations/supabase/client";

const STATIC_RECEIVER_CODE = "SRGEC";

export const useReceiverPeer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isReceiver, setIsReceiver] = useState(false);
  const { user } = useAuth();
  const { addToQueue } = useQueue();

  const fetchPendingFiles = useCallback(async () => {
    console.log('Fetching pending files...');
    
    try {
      const { data: transfers, error } = await supabase
        .from('pending_transfers')
        .select('*')
        .eq('downloaded', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending transfers:', JSON.stringify(error, null, 2));
        return;
      }

      console.log('Found transfers:', transfers?.length || 0);

      if (!transfers || transfers.length === 0) {
        return;
      }

    // Group files by sender
    const senderGroups = transfers.reduce((acc, transfer) => {
      if (!acc[transfer.sender_name]) {
        acc[transfer.sender_name] = [];
      }
      acc[transfer.sender_name].push(transfer);
      return acc;
    }, {} as Record<string, typeof transfers>);

    // Process each sender's files
    for (const [senderName, files] of Object.entries(senderGroups)) {
      const queueFiles = [];
      
      for (const transfer of files) {
        try {
          console.log(`Downloading file: ${transfer.file_name} from path: ${transfer.storage_path}`);
          
          // Download file from storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('pending-files')
            .download(transfer.storage_path);

          if (downloadError) {
            console.error('Download error details:', JSON.stringify(downloadError, null, 2));
            continue;
          }
          
          console.log('Download successful, blob size:', fileData?.size);

          queueFiles.push({
            name: transfer.file_name,
            size: transfer.file_size,
            type: transfer.file_type || 'application/octet-stream',
            blob: fileData
          });

          // Mark as downloaded
          await supabase
            .from('pending_transfers')
            .update({ downloaded: true })
            .eq('id', transfer.id);

          // Delete from storage
          await supabase.storage
            .from('pending-files')
            .remove([transfer.storage_path]);

          // Delete the record
          await supabase
            .from('pending_transfers')
            .delete()
            .eq('id', transfer.id);

        } catch (err) {
          console.error('Error processing file:', err);
        }
      }

      if (queueFiles.length > 0) {
        addToQueue(senderName, queueFiles);
        toast.success(`${senderName} sent ${queueFiles.length} file(s)`);
      }
    }
    } catch (err) {
      console.error('Error in fetchPendingFiles:', err);
    }
  }, [addToQueue]);

  // Poll for new files when receiver is active
  useEffect(() => {
    if (!isReceiver) return;

    // Initial fetch
    fetchPendingFiles();

    // Poll every 5 seconds
    const interval = setInterval(fetchPendingFiles, 5000);

    return () => clearInterval(interval);
  }, [isReceiver, fetchPendingFiles]);

  const startReceiver = useCallback(async () => {
    if (!user) {
      toast.error("Please login to access receiver mode");
      return;
    }

    console.log("User authorized:", user.username);
    console.log("Starting receiver with code:", STATIC_RECEIVER_CODE);

    setIsConnected(true);
    setIsReceiver(true);
    toast.success("Receiver mode active! Code: SRGEC");

    // Fetch any pending files immediately
    await fetchPendingFiles();
  }, [user, fetchPendingFiles]);

  const stopReceiver = useCallback(() => {
    setIsConnected(false);
    setIsReceiver(false);
    toast.info("Receiver mode stopped");
  }, []);

  return {
    isConnected,
    isReceiver,
    startReceiver,
    stopReceiver,
    receiverCode: STATIC_RECEIVER_CODE
  };
};
