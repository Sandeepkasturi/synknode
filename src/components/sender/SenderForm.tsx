import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useSenderPeer } from "@/hooks/useSenderPeer";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { OrbitalAnimation } from "@/components/OrbitalAnimation";
import { SenderQueue } from "./SenderQueue";
import { validateFiles, getRemainingDailyFiles, incrementDailyFileCount } from "@/utils/fileTransfer.utils";
import { MAX_FILE_SIZE } from "@/types/fileTransfer.types";

export const SenderForm: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [name, setName] = useState<string>(() => localStorage.getItem('sender_name') || '');
  const { sendFiles, transferProgress } = useSenderPeer();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = validateFiles(acceptedFiles);
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: MAX_FILE_SIZE
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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

    if (!incrementDailyFileCount(selectedFiles.length)) {
      return;
    }

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

  // Show orbital animation during transfer
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
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
        <p className="text-xs text-muted-foreground mb-0.5">Sending to:</p>
        <p className="text-xl font-bold tracking-widest text-primary font-display">SRGEC</p>
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative p-6 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
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
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-foreground font-medium">
              Drop files here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Max 50MB per file · {getRemainingDailyFiles()} remaining today
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
            <p className="text-xs text-muted-foreground text-center pt-1">Click or drag to add more</p>
          </div>
        )}
      </div>

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
        disabled={selectedFiles.length === 0 || !name.trim() || transferProgress.active}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
      >
        <Send className="h-4 w-4 mr-2" />
        {transferProgress.active ? 'Sending…' : `Send ${selectedFiles.length} File(s)`}
      </Button>

      {/* Queue */}
      <div className="pt-5 border-t border-border/50">
        <SenderQueue />
      </div>
    </div>
  );
};
