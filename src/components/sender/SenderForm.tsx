import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Send, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useSenderPeer } from "@/hooks/useSenderPeer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { OrbitalAnimation } from "@/components/OrbitalAnimation";
import { SenderQueue } from "./SenderQueue";
import { validateFiles, registerUserForHour, getRemainingHourlySlots } from "@/utils/fileTransfer.utils";

export const SenderForm: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [name, setName] = useState<string>(() => localStorage.getItem('sender_name') || '');
  const [checkingName, setCheckingName] = useState(false);
  const { sendFiles, transferProgress } = useSenderPeer();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = await validateFiles(acceptedFiles);
    if (validFiles.length === 0) return;

    setSelectedFiles(prev => {
      const seen = new Set(prev.map(f => `${f.name}|${f.size}|${f.lastModified}`));
      const fresh = validFiles.filter(f => !seen.has(`${f.name}|${f.size}|${f.lastModified}`));
      const skipped = validFiles.length - fresh.length;

      if (fresh.length > 0) toast.success(`${fresh.length} file(s) added`);
      if (skipped > 0) toast.info(`${skipped} file(s) already in your list`);

      return [...prev, ...fresh];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Returns true when the name is free (or already owned by this device)
  const isUsernameAvailable = async (candidate: string) => {
    const ownName = localStorage.getItem('sender_name');
    if (ownName && ownName.toLowerCase() === candidate.toLowerCase()) return true;

    const { data, error } = await supabase
      .from('pending_transfers')
      .select('sender_name')
      .ilike('sender_name', candidate)
      .eq('downloaded', false)
      .limit(1);

    if (error) return true; // don't block on lookup failure
    if (data && data.length > 0) {
      const suggestion = `${candidate}_${Math.floor(Math.random() * 90 + 10)}`;
      toast.error(`Username "${candidate}" already exists`, {
        description: `Someone is already in the queue with this name. Try something different — for example "${suggestion}".`
      });
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select files to send");
      return;
    }

    setCheckingName(true);
    const available = await isUsernameAvailable(name.trim());
    setCheckingName(false);
    if (!available) return;

    if (!registerUserForHour(name.trim())) {
      return;
    }

    localStorage.setItem('sender_name', name.trim());

    try {
      await sendFiles(selectedFiles, name);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Send failed:', error);
    }
  };


  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

  if (transferProgress.active && transferProgress.status === 'transferring') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 space-y-6"
      >
        <OrbitalAnimation isTransferring={true} size="lg" />
        <div className="text-center space-y-1">
          <p className="text-base font-medium text-foreground">Sending files…</p>
          <p className="text-sm text-muted-foreground">{transferProgress.currentFile}</p>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <Progress value={transferProgress.progress} className="h-1.5" />
          <p className="text-center text-xs text-primary font-medium">{transferProgress.progress}%</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Name Input */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-primary" />
          Your Name
        </label>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-secondary/40 border-border focus:border-primary"
          disabled={transferProgress.active}
        />
      </div>

      {/* Receiver Code */}
      <div className="border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-muted-foreground mb-0.5">Sending to:</p>
        <p className="text-xl font-bold tracking-widest text-primary font-display">SRGEC</p>
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative p-8 border-2 border-dashed rounded-md transition-all duration-200 cursor-pointer
          ${isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-secondary/30"
          }
          ${transferProgress.active ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} disabled={transferProgress.active} />
        
        {selectedFiles.length === 0 ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 rotate-45 items-center justify-center border border-primary/30 bg-primary/10">
              <Upload className="h-5 w-5 -rotate-45 text-primary" />
            </div>
            <p className="text-sm text-foreground font-medium">
              Drop files here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Up to 5GB total · {getRemainingHourlySlots()} user slots this hour
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <File className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                    disabled={transferProgress.active}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">Click or drag to add more</p>
              <p className="text-xs font-medium text-primary">{formatFileSize(totalSize)} total</p>
            </div>
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={open}
            disabled={transferProgress.active}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add more files
          </Button>
          <button
            type="button"
            onClick={() => setSelectedFiles([])}
            disabled={transferProgress.active}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear all
          </button>
        </div>
      )}


      {/* Connecting state */}
      {transferProgress.active && transferProgress.status === 'connecting' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-lg bg-secondary/50 border border-border/50 flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
          />
          <span className="text-sm text-foreground">Connecting…</span>
        </motion.div>
      )}

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={selectedFiles.length === 0 || !name.trim() || transferProgress.active || checkingName}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
      >
        <Send className="h-4 w-4 mr-2" />
        {checkingName ? 'Checking name…' : transferProgress.active ? 'Sending…' : `Send ${selectedFiles.length} File(s)`}
      </Button>


      {/* Queue */}
      <div className="pt-5 border-t border-border/50">
        <SenderQueue />
      </div>
    </div>
  );
};
