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
}

const QueueContext = createContext<QueueContextType>({} as QueueContextType);

export const useQueue = () => useContext(QueueContext);

export const QueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [senderName] = useState<string>(() => localStorage.getItem('sender_name') || '');

  // Fetch initial queue and subscribe to changes
  React.useEffect(() => {
    if (!senderName) return;

    const fetchQueue = async () => {
      const { data, error } = await supabase
        .from('pending_transfers')
        .select('*')
        .eq('sender_name', senderName)
        .eq('downloaded', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching queue:', error);
        return;
      }

      const formattedQueue: QueueEntry[] = data.map(item => ({
        id: item.id,
        senderName: item.sender_name,
        files: [{
          name: item.file_name,
          size: item.file_size,
          type: item.file_type || 'application/octet-stream',
          storagePath: item.storage_path
        }],
        timestamp: new Date(item.created_at).getTime(),
        status: 'waiting'
      }));

      setQueue(formattedQueue);
    };

    fetchQueue();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_transfers',
          filter: `sender_name=eq.${senderName}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new;
            setQueue(prev => {
              // Prevent duplicate entries in local state if multiple tabs receive the event
              if (prev.some(entry => entry.id === newItem.id)) return prev;

              return [...prev, {
                id: newItem.id,
                senderName: newItem.sender_name,
                files: [{
                  name: newItem.file_name,
                  size: newItem.file_size,
                  type: newItem.file_type || 'application/octet-stream',
                  storagePath: newItem.storage_path
                }],
                timestamp: new Date(newItem.created_at).getTime(),
                status: 'waiting'
              }];
            });
          } else if (payload.eventType === 'DELETE') {
            setQueue(prev => prev.filter(entry => entry.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            // If marked as downloaded loop or something changed
            if (payload.new.downloaded) {
              setQueue(prev => prev.filter(entry => entry.id !== payload.new.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [senderName]);

  const addToQueue = useCallback((_senderName: string, _files: QueueFile[]): string => {
    // This is now handled by the useSenderPeer hook directly interacting with Supabase.
    // The subscription will update the UI.
    // keeping this function signature for compatibility but it might be essentially no-op 
    // or just a local optimistic update if needed (but prefer source of truth from DB)
    return "";
  }, []);

  const removeFromQueue = useCallback(async (entryId: string) => {
    // Remove from Supabase
    const { error } = await supabase
      .from('pending_transfers')
      .delete()
      .eq('id', entryId);

    if (error) {
      toast.error("Failed to remove from queue");
      console.error(error);
    } else {
      setQueue(prev => prev.filter(entry => entry.id !== entryId));
      toast.success("Removed from queue");
    }
  }, []);

  const updateEntryStatus = useCallback((entryId: string, status: QueueEntry['status']) => {
    setQueue(prev => prev.map(entry =>
      entry.id === entryId ? { ...entry, status } : entry
    ));
  }, []);

  const getQueueEntry = useCallback((entryId: string): QueueEntry | undefined => {
    return queue.find(entry => entry.id === entryId);
  }, [queue]);

  return (
    <QueueContext.Provider value={{ queue, addToQueue, removeFromQueue, updateEntryStatus, getQueueEntry }}>
      {children}
    </QueueContext.Provider>
  );
};
