export interface QueueEntry {
  id: string;
  senderName: string;
  files: QueueFile[];
  timestamp: number;
  status: 'waiting' | 'downloading' | 'completed';
}

export interface QueueFile {
  name: string;
  size: number;
  type: string;
  blob?: Blob;
  storagePath?: string;
}

export interface SenderInfo {
  name: string;
  peerId: string;
}
