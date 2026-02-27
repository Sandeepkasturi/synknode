import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Clock, FileIcon, FolderOpen, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PendingFile {
  id: string;
  sender_name: string;
  file_name: string;
  file_size: number;
  file_type: string | null;
  created_at: string;
}

export const SenderQueue: React.FC = () => {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const fetchPendingFiles = async () => {
    const { data, error } = await supabase
      .from('pending_transfers')
      .select('*')
      .eq('downloaded', false)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setPendingFiles(data);
    }
  };

  useEffect(() => {
    fetchPendingFiles();
    const channel = supabase
      .channel('sender-queue-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_transfers' }, () => fetchPendingFiles())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupedBySender = pendingFiles.reduce((acc, file) => {
    if (!acc[file.sender_name]) acc[file.sender_name] = [];
    acc[file.sender_name].push(file);
    return acc;
  }, {} as Record<string, PendingFile[]>);

  const senderEntries = Object.entries(groupedBySender);

  if (senderEntries.length === 0) {
    return (
      <div className="text-center py-6">
        <FolderOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Queue is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Queue
          <span className="text-xs text-muted-foreground">({pendingFiles.length})</span>
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15">
          FIFO · {senderEntries.length} sender{senderEntries.length !== 1 ? 's' : ''}
        </span>
      </div>

      <AnimatePresence>
        {senderEntries.map(([senderName, files], queueIndex) => (
          <motion.div
            key={senderName}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ delay: queueIndex * 0.04 }}
            className="p-3 rounded-lg border border-border/50 bg-secondary/20"
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">#{queueIndex + 1}</span>
                </div>
                <span className="text-[9px] text-muted-foreground">of {senderEntries.length}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <User className="h-3 w-3 text-primary" />
                  <span className="font-medium text-sm text-foreground">{senderName}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {formatTime(files[0].created_at)}
                  </span>
                </div>

                <div className="space-y-1">
                  {files.map((file, fileIndex) => (
                    <div key={file.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-background/60">
                      <Hash className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{fileIndex + 1}</span>
                      <FileIcon className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-foreground truncate flex-1">{file.file_name}</span>
                      <span className="text-muted-foreground font-mono text-[10px]">{formatFileSize(file.file_size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <p className="text-[10px] text-center text-muted-foreground pt-1">
        Processed <span className="font-medium text-primary">first in, first out</span>
      </p>
    </div>
  );
};
