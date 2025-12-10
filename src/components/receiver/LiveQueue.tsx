import React from "react";
import { useQueue } from "@/context/QueueContext";
import { Download, User, Clock, FileIcon, Trash2, FolderOpen } from "lucide-react";
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
    // Prefix filename with sender name for organization
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
      // Download each file individually with sender name prefix
      for (const file of entry.files) {
        if (file.blob) {
          downloadFile(file.blob, file.name, entry.senderName);
          // Small delay between downloads to prevent browser blocking
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      updateEntryStatus(entryId, 'completed');
      toast.success(`Downloaded ${entry.files.length} file(s) from ${entry.senderName}`);

      // Auto-remove from queue after download
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
      <div className="text-center py-12">
        <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Queue is empty</h3>
        <p className="text-sm text-muted-foreground">
          Files sent to code SRGEC will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Live Queue ({queue.length})
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
            className={`p-4 rounded-lg border transition-all ${
              entry.status === 'downloading' 
                ? 'bg-primary/10 border-primary/30' 
                : entry.status === 'completed'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-card border-border hover:border-primary/30'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Sender Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{entry.senderName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Files List */}
                <div className="space-y-2 pl-10">
                  {entry.files.map((file, fileIndex) => (
                    <div 
                      key={fileIndex}
                      className="flex items-center gap-2 text-sm"
                    >
                      <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground truncate">{file.name}</span>
                      <span className="text-muted-foreground text-xs flex-shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => downloadEntry(entry.id)}
                  disabled={entry.status === 'downloading' || entry.status === 'completed'}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  {entry.status === 'downloading' ? 'Downloading...' : 
                   entry.status === 'completed' ? 'Done' : 'Download'}
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
