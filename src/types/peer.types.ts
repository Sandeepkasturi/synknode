
import Peer from "peerjs";

// Define the type for message data
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string | 'broadcast';
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'token';
  fileData?: {
    name: string;
    size: number;
    type: string;
    url?: string;
    files?: Array<{
      name: string;
      size: number;
      type: string;
    }>;
  };
}

// Define the type for the device announcement data
export interface DeviceAnnouncementData {
  type: string;
  username: string;
}

export interface OnlineDevice {
  id: string;
  username: string;
  lastSeen?: number;
}

export interface PeerContextType {
  peer: Peer | null;
  peerId: string | null;
  isConnected: boolean;
  username: string | null;
  setUsername: (name: string) => void;
  onlineDevices: OnlineDevice[];
  createNewPeer: (customPeerId?: string) => void;
  destroyPeer: () => void;
  scanForDevices: () => void;
  isScanning: boolean;
  registerDevice: (deviceId: string, deviceUsername: string) => void;
  sendChatMessage: (receiverId: string | 'broadcast', content: string, type?: 'text' | 'file' | 'token', fileData?: any) => void;
  chatMessages: Record<string, ChatMessage[]>; // Messages organized by peer ID
  announcePresence: () => void;
  broadcastMessage: (content: string, type?: 'text' | 'file' | 'token', fileData?: any) => void;
  broadcastData: (data: any) => void; // New method to broadcast any data to all peers
}
