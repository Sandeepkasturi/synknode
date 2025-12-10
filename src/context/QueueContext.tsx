import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
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

  const addToQueue = useCallback((senderName: string, files: QueueFile[]): string => {
    const entryId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newEntry: QueueEntry = {
      id: entryId,
      senderName,
      files,
      timestamp: Date.now(),
      status: 'waiting'
    };

    setQueue(prev => [...prev, newEntry]);
    toast.success(`${senderName} added ${files.length} file(s) to queue`);
    
    return entryId;
  }, []);

  const removeFromQueue = useCallback((entryId: string) => {
    setQueue(prev => prev.filter(entry => entry.id !== entryId));
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
