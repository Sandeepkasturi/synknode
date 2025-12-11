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

export const SenderForm: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [name, setName] = useState<string>(() => localStorage.getItem('sender_name') || '');
  const { sendFiles, transferProgress } = useSenderPeer();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    toast.success(`${acceptedFiles.length} file(s) added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-8 space-y-6"
      >
        <OrbitalAnimation isTransferring={true} size="lg" />
        
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">
            Sending files to receiver...
          </p>
          <p className="text-sm text-muted-foreground">
            {transferProgress.currentFile}
          </p>
        </div>
        
        <div className="w-full max-w-xs space-y-2">
          <Progress value={transferProgress.progress} className="h-2" />
          <p className="text-center text-sm text-primary font-medium">
            {transferProgress.progress}%
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Your Name
        </label>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-secondary/50 border-border/50 focus:border-primary"
          disabled={transferProgress.active}
        />
      </div>

      {/* Receiver Code Display */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-400/10 border border-primary/20">
        <p className="text-sm text-muted-foreground mb-1">Sending to receiver code:</p>
        <p className="text-2xl font-bold tracking-widest bg-gradient-to-r from-primary via-purple-500 to-cyan-400 bg-clip-text text-transparent">
          SRGEC
        </p>
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative p-8 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
          ${isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border/50 hover:border-primary/50 hover:bg-secondary/30"
          }
          ${transferProgress.active ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} disabled={transferProgress.active} />
        
        {selectedFiles.length === 0 ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-foreground font-medium">
              Drag & drop files here, or click to select
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Select multiple files to send
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-3 bg-secondary/50 backdrop-blur-sm rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <File className="h-4 w-4 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors group"
                    disabled={transferProgress.active}
                  >
                    <X className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <p className="text-xs text-muted-foreground text-center pt-2">
              Click or drag to add more files
            </p>
          </div>
        )}
      </div>

      {/* Transfer Progress (for connecting state) */}
      {transferProgress.active && transferProgress.status === 'connecting' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-secondary/50 border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
              />
            </div>
            <span className="text-sm text-foreground">Connecting to receiver...</span>
          </div>
        </motion.div>
      )}

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={selectedFiles.length === 0 || !name.trim() || transferProgress.active}
        className="w-full bg-gradient-to-r from-primary via-purple-500 to-primary hover:opacity-90 transition-opacity"
        size="lg"
      >
        <Send className="h-4 w-4 mr-2" />
        {transferProgress.active ? 'Sending...' : `Send ${selectedFiles.length} File(s)`}
      </Button>
    </div>
  );
};
