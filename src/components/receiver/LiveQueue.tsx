import React, { useState, useEffect, useMemo } from "react";
import { useQueue } from "@/context/QueueContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Download, Clock, FileIcon, Trash2, FolderOpen, CheckCircle,
  Eye, ShieldAlert, ChevronRight, Search, X, SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { QueueFile, QueueEntry } from "@/types/queue.types";
import { FilePreview } from "./FilePreview";
import { getFileSecurityIssue } from "@/utils/fileTransfer.utils";

type SortKey = "fifo" | "newest" | "most";

export const LiveQueue: React.FC = () => {
  const { queue, removeFromQueue, updateEntryStatus } = useQueue();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<QueueFile | null>(null);
  const [previewSender, setPreviewSender] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("fifo");
  const [pendingOnly, setPendingOnly] = useState(false);

  const ordered = useMemo(() => [...queue].sort((a, b) => a.timestamp - b.timestamp), [queue]);

  // Auto-expand the first sender in line
  useEffect(() => {
    if (ordered.length === 0) { setExpanded(null); return; }
    if (!expanded || !ordered.find(e => e.id === expanded)) setExpanded(ordered[0].id);
  }, [ordered, expanded]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  const formatStamp = (ts: number) =>
    new Date(ts).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

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

  const term = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    let list = ordered;
    if (term) {
      list = list.filter(e =>
        e.senderName.toLowerCase().includes(term) ||
        e.files.some(f => f.name.toLowerCase().includes(term)));
    }
    if (pendingOnly) list = list.filter(e => e.status !== 'completed');
    const sorted = [...list];
    if (sort === 'newest') sorted.sort((a, b) => b.timestamp - a.timestamp);
    else if (sort === 'most') sorted.sort((a, b) => b.files.length - a.files.length);
    return sorted;
  }, [ordered, term, pendingOnly, sort]);

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
  const pendingCount = queue.filter(e => e.status !== 'completed').length;

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
      active
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-secondary/40 text-muted-foreground border-border/60 hover:text-foreground'
    }`;

  const totalSize = (entry: QueueEntry) => entry.files.reduce((s, f) => s + (f.size || 0), 0);

  return (
    <div className="space-y-4">
      <FilePreview file={previewFile} senderName={previewSender} open={previewOpen} onOpenChange={setPreviewOpen} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl leading-none text-primary">Queue</h3>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
            {totalFiles} files · {queue.length} users
          </p>
        </div>
        <span className="p-2 rounded-full bg-secondary/40 border border-border/60 text-primary">
          <SlidersHorizontal className="h-4 w-4" />
        </span>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users or files..."
            className="w-full bg-secondary/40 border border-border/60 rounded-xl py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button className={chip(sort === 'fifo' && !pendingOnly)} onClick={() => { setSort('fifo'); setPendingOnly(false); }}>
            All senders · FIFO
          </button>
          <button className={chip(pendingOnly)} onClick={() => setPendingOnly(v => !v)}>
            Pending ({pendingCount})
          </button>
          <button className={chip(sort === 'newest')} onClick={() => setSort('newest')}>Newest first</button>
          <button className={chip(sort === 'most')} onClick={() => setSort('most')}>Most files</button>
        </div>
      </div>

      {/* Accordion list */}
      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">No matching senders or files</p>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {filtered.map((entry) => {
            const position = ordered.indexOf(entry) + 1;
            const isOpen = expanded === entry.id;
            const done = entry.status === 'completed';
            return (
              <div
                key={entry.id}
                className={`rounded-2xl border overflow-hidden transition-colors ${
                  isOpen ? 'border-primary/40 bg-card' : 'border-border/60 bg-secondary/20'
                }`}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      done ? 'bg-green-500 text-white'
                        : isOpen ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {done ? <CheckCircle className="h-4 w-4" /> : `#${position}`}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">{entry.senderName}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        {formatStamp(entry.timestamp)} · {entry.files.length} file{entry.files.length !== 1 ? 's' : ''} · {formatFileSize(totalSize(entry))}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-90 text-primary' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3">
                        <div className="flex gap-2 pb-3 border-b border-border/60 mb-2">
                          <button
                            onClick={() => downloadEntry(entry.id)}
                            disabled={entry.status === 'downloading' || done}
                            className={`flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg transition-colors ${
                              done ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            } disabled:opacity-70`}
                          >
                            {entry.status === 'downloading' ? (
                              <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3 h-3 border-2 border-current border-t-transparent rounded-full" /> Saving</>
                            ) : done ? (
                              <><CheckCircle className="h-3.5 w-3.5" /> Done</>
                            ) : (
                              <><Download className="h-3.5 w-3.5" /> Get all files</>
                            )}
                          </button>
                          <button
                            onClick={() => { removeFromQueue(entry.id); toast.info("Removed"); }}
                            className="px-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            title="Remove from queue"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                          {entry.files.map((file, i) => {
                            const issue = getFileSecurityIssue({ name: file.name, type: file.type });
                            return (
                              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 hover:bg-primary/5 transition-colors">
                                <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center border border-border/60 bg-background ${issue ? 'text-destructive' : 'text-primary'}`}>
                                  {issue ? <ShieldAlert className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />}
                                </div>
                                <button
                                  onClick={() => openPreview(file, entry.senderName)}
                                  className="flex-1 min-w-0 text-left"
                                >
                                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                  <span className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">
                                    {formatFileSize(file.size)} · {issue ? <span className="text-destructive">Blocked</span> : <span className="text-primary">Waiting</span>}
                                  </span>
                                </button>
                                <button
                                  onClick={() => openPreview(file, entry.senderName)}
                                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  title="Preview"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => downloadSingleFile(file, entry.senderName)}
                                  disabled={!!issue}
                                  className="p-2 rounded-lg text-primary hover:bg-primary/10 disabled:opacity-30"
                                  title="Download"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
