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
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          const { data, error } = await supabase.storage
            .from('pending-files')
            .download(file.storagePath);
          if (error) throw error;
          if (data) downloadFile(data, file.name, entry.senderName);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      await supabase.from('pending_transfers').update({ downloaded: true }).eq('id', entryId);
      for (const file of entry.files) {
        if (file.storagePath) {
          await supabase.storage.from('pending-files').remove([file.storagePath]);
        }
      }
      await supabase.from('pending_transfers').delete().eq('id', entryId);

      updateEntryStatus(entryId, 'completed');
      toast.success(`Downloaded ${entry.files.length} file(s) from ${entry.senderName}`);
      setTimeout(() => removeFromQueue(entryId), 2000);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download files');
      updateEntryStatus(entryId, 'waiting');
    }
  };

  if (queue.length === 0) {
    return (
      <div className="text-center py-10">
        <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-sm font-medium text-foreground mb-1">No files yet</p>
        <p className="text-xs text-muted-foreground">
          Files sent to <span className="font-mono font-semibold text-primary">SRGEC</span> appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Queue
          <span className="text-xs text-muted-foreground">({queue.length})</span>
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15">
          FIFO · {queue.length} pending
        </span>
      </div>

      <AnimatePresence>
        {queue.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ delay: index * 0.06 }}
            className={`p-3.5 rounded-xl border transition-all ${
              entry.status === 'downloading'
                ? 'bg-primary/5 border-primary/25'
                : entry.status === 'completed'
                  ? 'bg-green-500/5 border-green-500/25'
                  : 'bg-secondary/20 border-border/50 hover:border-primary/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  entry.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                }`}>
                  {entry.status === 'completed' 
                    ? <CheckCircle className="h-4 w-4 text-white" />
                    : <span className="text-xs font-bold text-primary-foreground">#{index + 1}</span>
                  }
                </div>
                <span className="text-[9px] text-muted-foreground">of {queue.length}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-3 w-3 text-primary" />
                  <span className="font-medium text-sm text-foreground">{entry.senderName}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {formatTime(entry.timestamp)}
                  </span>
                </div>

                <div className="space-y-1">
                  {entry.files.map((file, fileIndex) => (
                    <div key={fileIndex} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-background/60">
                      <span className="text-[10px] text-muted-foreground font-mono w-4">#{fileIndex + 1}</span>
                      <FileIcon className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-foreground truncate flex-1">{file.name}</span>
                      <span className="text-muted-foreground text-[10px] font-mono">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => downloadEntry(entry.id)}
                  disabled={entry.status === 'downloading' || entry.status === 'completed'}
                  className={`text-xs h-8 ${
                    entry.status === 'completed'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {entry.status === 'downloading' ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" /> Saving</>
                  ) : entry.status === 'completed' ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Done</>
                  ) : (
                    <><Download className="h-3 w-3 mr-1" /> Get</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { removeFromQueue(entry.id); toast.info("Removed"); }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
