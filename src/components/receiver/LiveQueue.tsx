import React from "react";
import { useQueue } from "@/context/QueueContext";
import { supabase } from "@/integrations/supabase/client";
import { Download, User, Clock, FileIcon, Trash2, FolderOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const LiveQueue: React.FC = () => {
  const { queue, removeFromQueue, updateEntryStatus } = useQueue();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const downloadFile = (blob: Blob, fileName: string, senderName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${senderName}_${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadEntry = async (entryId: string) => {
    const entry = queue.find(e => e.id === entryId);
    if (!entry) return;

    updateEntryStatus(entryId, 'downloading');

    try {
      for (const file of entry.files) {
        if (file.blob) {
          downloadFile(file.blob, file.name, entry.senderName);
        } else if (file.storagePath) {
          // Download from Supabase
          const { data, error } = await supabase.storage
            .from('pending-files')
            .download(file.storagePath);

          if (error) throw error;

          if (data) {
            downloadFile(data, file.name, entry.senderName);

            // Update downloaded status in DB
            await supabase
              .from('pending_transfers')
              .update({ downloaded: true })
              .eq('id', entryId);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      updateEntryStatus(entryId, 'completed');
      toast.success(`Downloaded ${entry.files.length} file(s) from ${entry.senderName}`);

      setTimeout(() => {
        removeFromQueue(entryId);
      }, 2000);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download files');
      updateEntryStatus(entryId, 'waiting');
    }
  };

  const deleteEntry = (entryId: string) => {
    removeFromQueue(entryId);
    toast.info("Entry removed from queue");
  };

  if (queue.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Queue is empty</h3>
        <p className="text-sm text-muted-foreground">
          Files sent to code <span className="font-mono font-bold text-primary">SRGEC</span> will appear here
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Queue
          <span className="text-sm font-normal text-muted-foreground">({queue.length})</span>
        </h3>
      </div>

      <AnimatePresence>
        {queue.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border transition-all ${entry.status === 'downloading'
              ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10'
              : entry.status === 'completed'
                ? 'bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/10'
                : 'bg-secondary/30 border-border/50 hover:border-primary/30 hover:bg-secondary/50'
              }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Queue Number Badge */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-sm font-bold text-white">#{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Sender Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-full ${entry.status === 'completed' ? 'bg-green-500/20' : 'bg-primary/10'
                    }`}>
                    {entry.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{entry.senderName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(entry.timestamp)}
                      <span className="mx-1">•</span>
                      <span>{entry.files.length} file(s)</span>
                    </div>
                  </div>
                </div>

                {/* Files List */}
                <div className="space-y-1.5 pl-12">
                  {entry.files.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="flex items-center gap-2 text-sm p-2 rounded-lg bg-background/50"
                    >
                      <span className="text-xs text-muted-foreground font-mono w-5">#{fileIndex + 1}</span>
                      <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileIcon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-foreground truncate flex-1">{file.name}</span>
                      <span className="text-muted-foreground text-xs flex-shrink-0 font-mono">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => downloadEntry(entry.id)}
                  disabled={entry.status === 'downloading' || entry.status === 'completed'}
                  className={`gap-1.5 ${entry.status === 'completed'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gradient-to-r from-primary via-purple-500 to-primary hover:opacity-90'
                    }`}
                >
                  {entry.status === 'downloading' ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Downloading
                    </>
                  ) : entry.status === 'completed' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Done
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteEntry(entry.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
