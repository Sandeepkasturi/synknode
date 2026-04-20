import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { QueueEntry, QueueFile } from "../types/queue.types";
import { toast } from "sonner";

// ─── Extended QueueFile with hash verification ────────────────────────────────

export interface QueueFileWithHash extends QueueFile {
  fileHash?: string | null;
  hashVerified?: boolean | null; // null = no hash provided, true = verified, false = mismatch
}

interface QueueContextType {
  queue: QueueEntry[];
  addToQueue: (senderName: string, files: QueueFileWithHash[]) => string;
  removeFromQueue: (entryId: string) => void;
  updateEntryStatus: (entryId: string, status: QueueEntry["status"]) => void;
  getQueueEntry: (entryId: string) => QueueEntry | undefined;
  isReceiverMode: boolean;
  setReceiverMode: (mode: boolean) => void;
  refreshQueue: () => Promise<void>;
  getSenderNames: () => string[];
  getEntriesBySender: (senderName: string) => QueueEntry[];
}

const QueueContext = createContext<QueueContextType>({} as QueueContextType);

export const useQueue = () => useContext(QueueContext);

export const QueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isReceiverMode, setReceiverMode] = useState(false);

  // ── Add files to queue (called by useReceiverPeer after decryption) ────────
  const addToQueue = useCallback((senderName: string, files: QueueFileWithHash[]): string => {
    const entryId = crypto.randomUUID();
    const newEntry: QueueEntry = {
      id: entryId,
      senderName,
      files,
      timestamp: Date.now(),
      status: "waiting",
    };
    setQueue((prev) => [...prev, newEntry]);
    return entryId;
  }, []);

  // ── Remove from queue ──────────────────────────────────────────────────────
  const removeFromQueue = useCallback((entryId: string) => {
    setQueue((prev) => {
      const entry = prev.find((e) => e.id === entryId);
      if (entry) {
        // Revoke any blob URLs if held
        entry.files.forEach((f) => {
          if (f.blob) {
            // Blobs are cleaned up by the browser GC
          }
        });
      }
      return prev.filter((e) => e.id !== entryId);
    });
    toast.success("Removed from queue");
  }, []);

  const updateEntryStatus = useCallback((entryId: string, status: QueueEntry["status"]) => {
    setQueue((prev) =>
      prev.map((entry) => entry.id === entryId ? { ...entry, status } : entry)
    );
  }, []);

  const getQueueEntry = useCallback((entryId: string): QueueEntry | undefined => {
    return queue.find((entry) => entry.id === entryId);
  }, [queue]);

  const getSenderNames = useCallback((): string[] => {
    return queue.map((e) => e.senderName);
  }, [queue]);

  const getEntriesBySender = useCallback((senderName: string): QueueEntry[] => {
    return queue.filter((e) => e.senderName === senderName);
  }, [queue]);

  // No-op refreshQueue (queue is now live via PeerJS, not Supabase polling)
  const refreshQueue = useCallback(async () => {}, []);

  return (
    <QueueContext.Provider
      value={{
        queue,
        addToQueue,
        removeFromQueue,
        updateEntryStatus,
        getQueueEntry,
        isReceiverMode,
        setReceiverMode,
        refreshQueue,
        getSenderNames,
        getEntriesBySender,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};
