import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useSenderPeer } from "@/hooks/useSenderPeer";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <div className="space-y-6">
      {/* Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <User className="h-4 w-4" />
          Your Name
        </label>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background/50"
          disabled={transferProgress.active}
        />
      </div>

      {/* Receiver Code Display */}
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-muted-foreground mb-1">Sending to receiver code:</p>
        <p className="text-2xl font-bold tracking-widest text-primary">SRGEC</p>
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative p-8 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer
          ${isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
          }
          ${transferProgress.active ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} disabled={transferProgress.active} />
        
        {selectedFiles.length === 0 ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-foreground">
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
                  className="flex items-center justify-between p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
                    className="p-1 hover:bg-accent rounded-full transition-colors"
                    disabled={transferProgress.active}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
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

      {/* Transfer Progress */}
      {transferProgress.active && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-foreground">
              {transferProgress.status === 'connecting' ? 'Connecting...' : 
               transferProgress.status === 'transferring' ? `Sending: ${transferProgress.currentFile}` :
               transferProgress.status === 'completed' ? 'Complete!' : 'Processing...'}
            </span>
            <span className="text-muted-foreground">{transferProgress.progress}%</span>
          </div>
          <Progress value={transferProgress.progress} className="h-2" />
        </motion.div>
      )}

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={selectedFiles.length === 0 || !name.trim() || transferProgress.active}
        className="w-full"
        size="lg"
      >
        <Send className="h-4 w-4 mr-2" />
        {transferProgress.active ? 'Sending...' : `Send ${selectedFiles.length} File(s)`}
      </Button>
    </div>
  );
};
