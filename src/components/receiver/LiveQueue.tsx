import React, { useState, useEffect } from "react";
import { useQueue } from "@/context/QueueContext";
import { supabase } from "@/integrations/supabase/client";
import { Download, User, Clock, FileIcon, Trash2, FolderOpen, CheckCircle, Users, Eye, ShieldAlert, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { QueueFile } from "@/types/queue.types";
import { FilePreview } from "./FilePreview";
import { getFileSecurityIssue } from "@/utils/fileTransfer.utils";

export const LiveQueue: React.FC = () => {
  const { queue, removeFromQueue, updateEntryStatus } = useQueue();
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<QueueFile | null>(null);
  const [previewSender, setPreviewSender] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Auto-select first sender when queue populates
  useEffect(() => {
    if (queue.length > 0 && (!selectedSender || !queue.find(q => q.senderName === selectedSender))) {
      setSelectedSender(queue[0].senderName);
    }
    if (queue.length === 0) setSelectedSender(null);
  }, [queue, selectedSender]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' });

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
    const unsafe = entry.files.find(f => getFileSecurityIssue({ name: f.name, type: f.type }));
    if (unsafe) { toast.error(`Blocked unsafe file: ${unsafe.name}`); return; }

    updateEntryStatus(entryId, 'downloading');
    try {
      for (const file of entry.files) {
        if (file.blob) downloadFile(file.blob, file.name, entry.senderName);
        else if (file.storagePath) {
          const { data, error } = await supabase.storage.from('pending-files').download(file.storagePath);
          if (error) throw error;
          if (data) downloadFile(data, file.name, entry.senderName);
        }
        await new Promise(r => setTimeout(r, 300));
      }
      for (const file of entry.files) {
        if (file.dbId) {
          await supabase.from('pending_transfers').update({ downloaded: true }).eq('id', file.dbId);
          if (file.storagePath) await supabase.storage.from('pending-files').remove([file.storagePath]);
          await supabase.from('pending_transfers').delete().eq('id', file.dbId);
          void import('@/lib/analytics').then(m => m.trackTransferDownloaded({
            sender_name: entry.senderName,
            file_name: file.name,
            file_size: file.size ?? 0,
            file_type: file.type ?? null,
          }));
        }
      }
      updateEntryStatus(entryId, 'completed');
      toast.success(`Downloaded ${entry.files.length} file(s) from ${entry.senderName}`);
      setTimeout(() => removeFromQueue(entryId), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Failed to download files');
      updateEntryStatus(entryId, 'waiting');
    }
  };

  const downloadSingleFile = async (file: QueueFile, senderName: string) => {
    if (getFileSecurityIssue({ name: file.name, type: file.type })) {
      toast.error(`Blocked unsafe file: ${file.name}`);
      return;
    }
    try {
      if (file.blob) downloadFile(file.blob, file.name, senderName);
      else if (file.storagePath) {
        const { data, error } = await supabase.storage.from('pending-files').download(file.storagePath);
        if (error) throw error;
        if (data) downloadFile(data, file.name, senderName);
      }
      toast.success(`Downloaded ${file.name}`);
    } catch (err) {
      console.error(err);
      toast.error('Download failed');
    }
  };

  const openPreview = (file: QueueFile, senderName: string) => {
    setPreviewFile(file);
    setPreviewSender(senderName);
    setPreviewOpen(true);
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

  const totalFiles = queue.reduce((s, e) => s + e.files.length, 0);
  const activeEntry = queue.find(e => e.senderName === selectedSender) ?? queue[0];

  return (
    <div className="space-y-3">
      <FilePreview file={previewFile} senderName={previewSender} open={previewOpen} onOpenChange={setPreviewOpen} />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Queue
          <span className="text-xs text-muted-foreground">({totalFiles} files · {queue.length} users)</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 rounded-xl border border-border/50 bg-secondary/10 overflow-hidden">
        {/* LEFT: user list */}
        <div className="border-b md:border-b-0 md:border-r border-border/50 bg-background/40 max-h-[420px] overflow-y-auto">
          <div className="p-2 text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3 w-3" /> Senders · FIFO
          </div>
          <ul className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
            {queue.map((entry, index) => {
              const isActive = entry.senderName === activeEntry?.senderName;
              return (
                <li key={entry.senderName} className="flex-shrink-0 md:flex-shrink">
                  <button
                    onClick={() => setSelectedSender(entry.senderName)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left border-l-2 transition-all ${
                      isActive
                        ? 'bg-primary/10 border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      entry.status === 'completed' ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary'
                    }`}>
                      {entry.status === 'completed' ? <CheckCircle className="h-3 w-3" /> : `#${index + 1}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{entry.senderName}</div>
                      <div className="text-[10px] opacity-70 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />{formatTime(entry.timestamp)} · {entry.files.length} file{entry.files.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {isActive && <ChevronRight className="h-3 w-3 text-primary flex-shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* RIGHT: files of selected sender */}
        <div className="p-3 min-w-0">
          <AnimatePresence mode="wait">
            {activeEntry && (
              <motion.div
                key={activeEntry.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-sm text-foreground truncate">{activeEntry.senderName}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {activeEntry.files.length} file{activeEntry.files.length !== 1 ? 's' : ''} · click any file to preview
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => downloadEntry(activeEntry.id)}
                      disabled={activeEntry.status === 'downloading' || activeEntry.status === 'completed'}
                      className={`text-xs h-8 ${
                        activeEntry.status === 'completed'
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      }`}
                    >
                      {activeEntry.status === 'downloading' ? (
                        <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" /> Saving</>
                      ) : activeEntry.status === 'completed' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Done</>
                      ) : (
                        <><Download className="h-3 w-3 mr-1" /> Get All</>
                      )}
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => { removeFromQueue(activeEntry.id); toast.info("Removed"); }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
                  {activeEntry.files.map((file, i) => {
                    const issue = getFileSecurityIssue({ name: file.name, type: file.type });
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-xs p-2 rounded-lg bg-background/70 border border-transparent hover:border-primary/20 group transition-colors ${issue ? 'hover:bg-destructive/5' : 'hover:bg-primary/5'}`}
                      >
                        <span className="text-[10px] text-muted-foreground font-mono w-5">#{i + 1}</span>
                        {issue
                          ? <ShieldAlert className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                          : <FileIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                        <button
                          onClick={() => openPreview(file, activeEntry.senderName)}
                          className="text-foreground truncate flex-1 text-left hover:text-primary transition-colors"
                          title="Preview"
                        >
                          {file.name}
                        </button>
                        <span className="text-muted-foreground text-[10px] font-mono">{formatFileSize(file.size)}</span>
                        <button
                          onClick={() => openPreview(file, activeEntry.senderName)}
                          className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition"
                          title="Preview"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => downloadSingleFile(file, activeEntry.senderName)}
                          disabled={!!issue}
                          className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition disabled:opacity-30"
                          title="Download"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
