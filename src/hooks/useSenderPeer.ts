import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TransferProgress {
  active: boolean;
  progress: number;
  status: 'idle' | 'connecting' | 'transferring' | 'completed' | 'error';
  currentFile?: string;
}

export const useSenderPeer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [senderName, setSenderName] = useState<string>(() => {
    return localStorage.getItem('sender_name') || '';
  });
  const [transferProgress, setTransferProgress] = useState<TransferProgress>({
    active: false,
    progress: 0,
    status: 'idle'
  });

  const updateSenderName = useCallback((name: string) => {
    setSenderName(name);
    localStorage.setItem('sender_name', name);
  }, []);

  const sendFiles = useCallback(async (files: File[], name: string) => {
    if (!name.trim()) {
      toast.error("Please enter your name first");
      return;
    }

    updateSenderName(name);
    setIsConnected(true);

    setTransferProgress({
      active: true,
      progress: 0,
      status: 'connecting'
    });

    try {
      setTransferProgress({
        active: true,
        progress: 0,
        status: 'transferring'
      });

      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = crypto.randomUUID();
        const storagePath = `${fileId}/${file.name}`;

        setTransferProgress({
          active: true,
          progress: Math.round((i / totalFiles) * 100),
          status: 'transferring',
          currentFile: file.name
        });

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('pending-files')
          .upload(storagePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Create pending transfer record
        const { error: insertError } = await supabase
          .from('pending_transfers')
          .insert({
            sender_name: name.trim(),
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: storagePath
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          // Clean up uploaded file
          await supabase.storage.from('pending-files').remove([storagePath]);
          throw new Error(`Failed to register ${file.name}`);
        }

        setTransferProgress({
          active: true,
          progress: Math.round(((i + 1) / totalFiles) * 100),
          status: 'transferring',
          currentFile: file.name
        });
      }

      setTransferProgress({
        active: true,
        progress: 100,
        status: 'completed'
      });

      toast.success("Files sent successfully!");

      // Clean up after delay
      setTimeout(() => {
        setTransferProgress({ active: false, progress: 0, status: 'idle' });
        setIsConnected(false);
      }, 3000);

    } catch (error) {
      console.error('Transfer error:', error);
      toast.error(error instanceof Error ? error.message : "Error during file transfer");
      setTransferProgress({ active: false, progress: 0, status: 'error' });
      setIsConnected(false);
    }
  }, [updateSenderName]);

  return {
    isConnected,
    senderName,
    updateSenderName,
    sendFiles,
    transferProgress
  };
};
