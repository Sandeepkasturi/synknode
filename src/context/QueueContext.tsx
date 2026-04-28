import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QueueEntry, QueueFile } from "../types/queue.types";
import { toast } from "sonner";

interface QueueContextType {
  queue: QueueEntry[];
  addToQueue: (senderName: string, files: QueueFile[]) => string;
  removeFromQueue: (entryId: string) => void;
  updateEntryStatus: (entryId: string, status: QueueEntry['status']) => void;
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

  const fetchQueue = useCallback(async () => {
    const { data, error } = await supabase
      .from('pending_transfers')
      .select('*')
      .eq('downloaded', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching queue:', error);
      return;
    }

    // Group by sender_name
    const grouped: Record<string, QueueEntry> = {};
    (data || []).forEach(item => {
      if (!grouped[item.sender_name]) {
        grouped[item.sender_name] = {
          id: item.sender_name, // Use sender_name as group id
          senderName: item.sender_name,
          files: [],
          timestamp: new Date(item.created_at).getTime(),
          status: 'waiting'
        };
      }
      grouped[item.sender_name].files.push({
        name: item.file_name,
        size: item.file_size,
        type: item.file_type || 'application/octet-stream',
        storagePath: item.storage_path,
        dbId: item.id
      });
      // Use earliest timestamp
      const ts = new Date(item.created_at).getTime();
      if (ts < grouped[item.sender_name].timestamp) {
        grouped[item.sender_name].timestamp = ts;
      }
    });

    setQueue(Object.values(grouped));
  }, []);

  React.useEffect(() => {
    if (!isReceiverMode) {
      setQueue([]);
      return;
    }

    fetchQueue();

    const channel = supabase
      .channel('receiver-queue-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pending_transfers' },
        () => {
          // Re-fetch to re-group properly
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isReceiverMode, fetchQueue]);

  const addToQueue = useCallback((_senderName: string, _files: QueueFile[]): string => {
    return "";
  }, []);

  const removeFromQueue = useCallback(async (entryId: string) => {
    // entryId is sender_name for grouped entries
    const entry = queue.find(e => e.id === entryId);
    if (!entry) return;

    // Delete all files for this sender
    for (const file of entry.files) {
      if (file.dbId) {
        await supabase.from('pending_transfers').delete().eq('id', file.dbId);
      }
    }
    
    setQueue(prev => prev.filter(e => e.id !== entryId));
    toast.success("Removed from queue");
  }, [queue]);

  const updateEntryStatus = useCallback((entryId: string, status: QueueEntry['status']) => {
    setQueue(prev => prev.map(entry =>
      entry.id === entryId ? { ...entry, status } : entry
    ));
  }, []);

  const getQueueEntry = useCallback((entryId: string): QueueEntry | undefined => {
    return queue.find(entry => entry.id === entryId);
  }, [queue]);

  const getSenderNames = useCallback((): string[] => {
    return queue.map(e => e.senderName);
  }, [queue]);

  const getEntriesBySender = useCallback((senderName: string): QueueEntry[] => {
    return queue.filter(e => e.senderName === senderName);
  }, [queue]);

  return (
    <QueueContext.Provider value={{ 
      queue, 
      addToQueue, 
      removeFromQueue, 
      updateEntryStatus, 
      getQueueEntry,
      isReceiverMode,
      setReceiverMode,
      refreshQueue: fetchQueue,
      getSenderNames,
      getEntriesBySender
    }}>
      {children}
    </QueueContext.Provider>
  );
};
