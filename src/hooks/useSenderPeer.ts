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
      let completedFiles = 0;
      const batchSize = 3; // Upload 3 files concurrently

      // Process files in batches
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);

        await Promise.all(batch.map(async (file) => {
          // Check for existing duplicate
          const { data: existingFiles } = await supabase
            .from('pending_transfers')
            .select('id')
            .eq('sender_name', name.trim())
            .eq('file_name', file.name)
            .eq('file_size', file.size)
            .eq('downloaded', false)
            .single();

          if (existingFiles) {
            console.log(`Skipping duplicate file: ${file.name}`);
            completedFiles++;
            setTransferProgress({
              active: true,
              progress: Math.round((completedFiles / totalFiles) * 100),
              status: 'transferring',
              currentFile: `Skipped duplicate: ${file.name}`
            });
            return;
          }

          const fileId = crypto.randomUUID();
          const storagePath = `${fileId}/${file.name}`;

          setTransferProgress({
            active: true,
            progress: Math.round((completedFiles / totalFiles) * 100),
            status: 'transferring',
            currentFile: `Uploading: ${file.name}`
          });

          // Upload file to Supabase Storage
          console.log(`Uploading file: ${file.name} to path: ${storagePath}`);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('pending-files')
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
          }
          
          console.log('Upload successful:', uploadData);

          // Create pending transfer record
          console.log('Creating pending transfer record...');
          const { data: insertData, error: insertError } = await supabase
            .from('pending_transfers')
            .insert({
              sender_name: name.trim(),
              file_name: file.name,
              file_type: file.type || 'application/octet-stream',
              file_size: file.size,
              storage_path: storagePath
            })
            .select()
            .single();

          if (insertError) {
            console.error('Insert error details:', JSON.stringify(insertError, null, 2));
            // Clean up uploaded file if DB insert fails
            await supabase.storage.from('pending-files').remove([storagePath]);
            throw new Error(`Failed to register ${file.name}: ${insertError.message}`);
          }
          
          console.log('Transfer record created:', insertData);

          completedFiles++;
          setTransferProgress({
            active: true,
            progress: Math.round((completedFiles / totalFiles) * 100),
            status: 'transferring',
            currentFile: file.name
          });
        }));
      }

      setTransferProgress({
        active: true,
        progress: 100,
        status: 'completed'
      });

      toast.success("Files processed successfully!");

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
