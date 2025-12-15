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

    // Subscribe to realtime changes
    const channel = supabase
      .channel('sender-queue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_transfers'
        },
        () => {
          fetchPendingFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group files by sender
  const groupedBySender = pendingFiles.reduce((acc, file) => {
    if (!acc[file.sender_name]) {
      acc[file.sender_name] = [];
    }
    acc[file.sender_name].push(file);
    return acc;
  }, {} as Record<string, PendingFile[]>);

  const senderEntries = Object.entries(groupedBySender);

  if (senderEntries.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary/50 flex items-center justify-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">Queue is empty</h3>
        <p className="text-xs text-muted-foreground">
          No pending files in the queue
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          Transfer Queue
          <span className="text-xs font-normal text-muted-foreground">
            ({pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''})
          </span>
        </h3>
      </div>

      <AnimatePresence>
        {senderEntries.map(([senderName, files], queueIndex) => (
          <motion.div
            key={senderName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ delay: queueIndex * 0.05 }}
            className="p-3 rounded-lg border bg-secondary/20 border-border/50"
          >
            <div className="flex items-start gap-3">
              {/* Queue Number Badge */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-xs font-bold text-white">#{queueIndex + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Sender Info */}
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-sm text-foreground">{senderName}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(files[0].created_at)}
                  </span>
                </div>

                {/* Files List */}
                <div className="space-y-1">
                  {files.map((file, fileIndex) => (
                    <div 
                      key={file.id}
                      className="flex items-center gap-2 text-xs p-1.5 rounded bg-background/50"
                    >
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{fileIndex + 1}</span>
                      <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileIcon className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-foreground truncate flex-1">{file.file_name}</span>
                      <span className="text-muted-foreground font-mono">
                        {formatFileSize(file.file_size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <p className="text-xs text-center text-muted-foreground pt-2">
        Files are processed in <span className="font-medium text-primary">First In, First Out</span> order
      </p>
    </div>
  );
};