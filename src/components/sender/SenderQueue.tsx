import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Clock, FileIcon, FolderOpen, Hash, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface PendingFile {
  id: string;
  sender_name: string;
  file_name: string;
  file_size: number;
  file_type: string | null;
  created_at: string;
}

type QueueTab = 'queue' | 'completed';

export const SenderQueue: React.FC<{ searchable?: boolean }> = ({ searchable = false }) => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<QueueTab>('queue');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [completedFiles, setCompletedFiles] = useState<PendingFile[]>([]);

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

  const fetchCompletedFiles = async () => {
    const { data, error } = await supabase
      .from('pending_transfers')
      .select('*')
      .eq('downloaded', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setCompletedFiles(data);
    }
  };

  useEffect(() => {
    fetchPendingFiles();
    fetchCompletedFiles();
    const channel = supabase
      .channel('sender-queue-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_transfers' }, () => {
        fetchPendingFiles();
        fetchCompletedFiles();
      })
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
    return new Date(timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const activeFiles = tab === 'queue' ? pendingFiles : completedFiles;

  const groupedBySender = activeFiles.reduce((acc, file) => {
    if (!acc[file.sender_name]) acc[file.sender_name] = [];
    acc[file.sender_name].push(file);
    return acc;
  }, {} as Record<string, PendingFile[]>);

  const senderEntries = Object.entries(groupedBySender);
  const visibleEntries = senderEntries.filter(([name, files]) => name.toLowerCase().includes(search.toLowerCase()) || files.some(f => f.file_name.toLowerCase().includes(search.toLowerCase())));

  if (activeFiles.length === 0) {
    return (
      <div className="glass-card text-center py-10">
        <FolderOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">{tab === 'queue' ? 'Queue is empty' : 'No completed transfers yet'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex rounded-full p-1.5 glass-card" role="tablist" aria-label="Queue filter">
            {(['queue', 'completed'] as QueueTab[]).map(t => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={`flex-1 sm:px-6 px-4 h-9 rounded-full text-xs font-semibold transition-all ${tab === t ? 'primary-gradient text-primary-foreground shadow-[var(--transfer-glow)]' : 'text-muted-foreground hover:text-foreground'}`}>
                {t === 'queue' ? `Queue (${pendingFiles.length})` : `Completed (${completedFiles.length})`}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 rounded-full h-12" aria-label="Search activity" placeholder="Search files or senders…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      )}
      {visibleEntries.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No matching transfers</p>}
      <AnimatePresence>
        {visibleEntries.map(([senderName, files]) => (
          <motion.div
            key={senderName}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center shadow-[var(--transfer-glow)]">
                  <span className="text-[10px] font-bold text-primary-foreground">#{tab === 'queue' ? senderEntries.findIndex(([n]) => n === senderName) + 1 : '✓'}</span>
                </div>
                {tab === 'queue' && <span className="text-[9px] text-muted-foreground">of {senderEntries.length}</span>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {tab === 'queue'
                    ? <User className="h-3 w-3 text-primary" />
                    : <CheckCircle2 className="h-3 w-3 text-success" />}
                  <span className="font-medium text-sm text-foreground truncate">{senderName}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {formatTime(tab === 'queue' ? files[0].created_at : files[0].created_at)}
                  </span>
                </div>

                <div className="space-y-1">
                  {files.map((file, fileIndex) => (
                    <div key={file.id} className="flex items-center gap-2 text-xs p-2 rounded-xl bg-background/50">
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

      {tab === 'queue' && <p className="text-[10px] text-center text-muted-foreground pt-1">
        Processed <span className="font-medium text-primary">first in, first out</span>
      </p>}
    </div>
  );
};
