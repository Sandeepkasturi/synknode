import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Send, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSenderPeer } from "@/hooks/useSenderPeer";
import { useFriends, FriendWithPresence } from "@/hooks/useFriends";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { OrbitalAnimation } from "@/components/OrbitalAnimation";
import { GestureIndicator } from "@/components/transfer/GestureIndicator";
import { QuickDropWindow } from "@/components/transfer/QuickDropWindow";
import { validateFiles } from "@/utils/fileTransfer.utils";

export const SenderForm: React.FC = () => {
  const { profile } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [name, setName] = useState<string>(profile?.username || "");
  const [selectedFriend, setSelectedFriend] = useState<FriendWithPresence | null>(null);

  const { sendFiles, transferProgress } = useSenderPeer();
  const { friends } = useFriends();
  const {
    gestureState,
    lastGamma,
    armGesture,
    disarm,
    setTransferring,
    setComplete,
    setFailed,
  } = useDeviceOrientation();

  const onlineFriends = friends.filter((f) => f.online);

  // ── File drop ──────────────────────────────────────────────────────────────
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = validateFiles(acceptedFiles);
    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Friend selection: arm gesture when ready ───────────────────────────────
  const handleSelectFriend = async (friend: FriendWithPresence | null) => {
    setSelectedFriend(friend);
    disarm();
    if (friend && selectedFiles.length > 0) {
      await armGesture(friend.peerId, selectedFiles[0]);
    }
  };

  // Update gesture target when files change
  React.useEffect(() => {
    if (selectedFriend && selectedFiles.length > 0 && gestureState === "IDLE") {
      armGesture(selectedFriend.peerId, selectedFiles[0]);
    } else if (selectedFiles.length === 0) {
      disarm();
    }
  }, [selectedFiles.length]);

  // ── Execute transfer ───────────────────────────────────────────────────────
  const executeSend = useCallback(async () => {
    if (!selectedFriend) {
      toast.error("Please select a friend to send to.");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select files to send.");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setTransferring();

    try {
      await sendFiles(selectedFiles, name, selectedFriend.peerId, selectedFriend.uid);
      setComplete();
      setSelectedFiles([]);
      setSelectedFriend(null);
      setTimeout(disarm, 2000);
    } catch (error) {
      setFailed();
      setTimeout(disarm, 2000);
    }
  }, [selectedFriend, selectedFiles, name, sendFiles, setTransferring, setComplete, setFailed, disarm]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

  // ── Transfer in-progress overlay ───────────────────────────────────────────
  if (transferProgress.active && transferProgress.status === "transferring") {
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
          <p className="text-center text-xs text-primary font-medium">
            {transferProgress.progress}%
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* QuickDrop portal overlay */}
      <QuickDropWindow
        gestureState={gestureState}
        file={selectedFiles[0] ?? null}
        sender={profile}
        receiver={selectedFriend}
        progress={transferProgress.progress}
        onCancel={disarm}
      />

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

        {/* Friend Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Send to
          </label>

          {onlineFriends.length === 0 ? (
            <div className="p-3 rounded-lg bg-secondary/20 border border-border/40 text-center">
              <p className="text-xs text-muted-foreground">No friends online. Add friends in the Friends tab.</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {onlineFriends.map((friend) => (
                <motion.button
                  key={friend.uid}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectFriend(selectedFriend?.uid === friend.uid ? null : friend)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                    selectedFriend?.uid === friend.uid
                      ? "bg-primary/10 border-2 border-primary"
                      : "border-2 border-transparent hover:border-primary/30"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={friend.photoURL ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {friend.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="online-dot absolute -bottom-0.5 -right-0.5 border-2 border-background" />
                  </div>
                  <span className="text-[10px] text-muted-foreground max-w-[48px] truncate">
                    {friend.username}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
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
              <p className="text-sm text-foreground font-medium">Drop files here or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">End-to-end encrypted · up to 5GB</p>
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

        {/* Connecting state */}
        {transferProgress.active && transferProgress.status === "connecting" && (
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
            <span className="text-sm text-foreground">Connecting to peer…</span>
          </motion.div>
        )}

        {/* Send Button */}
        <Button
          onClick={executeSend}
          disabled={selectedFiles.length === 0 || !name.trim() || !selectedFriend || transferProgress.active}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {transferProgress.active
            ? "Sending…"
            : selectedFriend
              ? `Send to ${selectedFriend.username}`
              : `Send ${selectedFiles.length > 0 ? selectedFiles.length + " File(s)" : ""}`}
        </Button>
      </div>

      {/* Gesture Indicator (floating) */}
      <GestureIndicator
        gestureState={gestureState}
        lastGamma={lastGamma}
        onManualSend={executeSend}
      />
    </>
  );
};
