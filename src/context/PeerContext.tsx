
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import Peer from "peerjs";
import { toast } from "sonner";

// Generate a 5-character token
export const generatePeerId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Define the type for message data
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'token';
  fileData?: {
    name: string;
    size: number;
    type: string;
    url?: string;
  };
}

// Define the type for the device announcement data
interface DeviceAnnouncementData {
  type: string;
  username: string;
}

interface PeerContextType {
  peer: Peer | null;
  peerId: string | null;
  isConnected: boolean;
  username: string | null;
  setUsername: (name: string) => void;
  onlineDevices: Array<{id: string, username: string}>;
  createNewPeer: (customPeerId?: string) => void;
  destroyPeer: () => void;
  announcePresence: () => void;
  registerDevice: (deviceId: string, deviceUsername: string) => void;
  sendChatMessage: (receiverId: string, content: string, type?: 'text' | 'file' | 'token', fileData?: any) => void;
  chatMessages: Record<string, ChatMessage[]>; // Messages organized by peer ID
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  activeChatPeer: string | null;
  setActiveChatPeer: (peerId: string | null) => void;
}

const PeerContext = createContext<PeerContextType>({
  peer: null,
  peerId: null,
  isConnected: false,
  username: null,
  setUsername: () => {},
  onlineDevices: [],
  createNewPeer: () => {},
  destroyPeer: () => {},
  announcePresence: () => {},
  registerDevice: () => {},
  sendChatMessage: () => {},
  chatMessages: {},
  isChatOpen: false,
  setIsChatOpen: () => {},
  activeChatPeer: null,
  setActiveChatPeer: () => {},
});

export const usePeer = () => useContext(PeerContext);

interface PeerProviderProps {
  children: ReactNode;
}

export const PeerProvider: React.FC<PeerProviderProps> = ({ children }) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('p2p_username');
  });
  const [onlineDevices, setOnlineDevices] = useState<Array<{id: string, username: string}>>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatPeer, setActiveChatPeer] = useState<string | null>(null);

  // Save username to localStorage whenever it changes
  useEffect(() => {
    if (username) {
      localStorage.setItem('p2p_username', username);
    }
  }, [username]);

  // Send a chat message to a peer
  const sendChatMessage = (receiverId: string, content: string, type: 'text' | 'file' | 'token' = 'text', fileData?: any) => {
    if (!peer || !peerId || !username) {
      toast.error("Not connected to the network");
      return;
    }

    try {
      const conn = peer.connect(receiverId);
      
      conn.on('open', () => {
        const message: ChatMessage = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          senderId: peerId,
          senderName: username,
          receiverId,
          content,
          timestamp: Date.now(),
          type,
          ...(fileData && { fileData })
        };

        // Send message to receiver
        conn.send({
          type: 'chat-message',
          message
        });

        // Store message in local state
        setChatMessages(prev => {
          const existingMessages = prev[receiverId] || [];
          return {
            ...prev,
            [receiverId]: [...existingMessages, message]
          };
        });

        toast.success(`Message sent to ${onlineDevices.find(d => d.id === receiverId)?.username || 'user'}`);
      });

      conn.on('error', (err) => {
        console.error('Error sending message:', err);
        toast.error("Failed to send message. User may be offline.");
      });
    } catch (err) {
      console.error('Error connecting to peer:', err);
      toast.error("Failed to connect to user");
    }
  };

  const createNewPeer = (customPeerId?: string) => {
    // Destroy existing peer if it exists
    if (peer) {
      peer.destroy();
    }

    // Create a new peer with optional custom ID
    const newPeerId = customPeerId || generatePeerId();
    
    console.log("Creating new peer with ID:", newPeerId);
    
    // Create new peer instance with configuration
    const newPeer = new Peer(newPeerId, {
      debug: 3, // For better logging
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" }
        ]
      }
    });

    newPeer.on('open', (id) => {
      console.log('Connected to P2P network with ID:', id);
      
      // If the id returned is not 5 characters, use our generated one
      const finalId = id.length !== 5 ? newPeerId : id;
      
      setPeerId(finalId);
      setIsConnected(true);
      
      // Only show toast if we're not already connected or if this is a custom peer ID
      if (!isConnected || customPeerId) {
        toast.success("Connected to P2P network!");
      }
      
      // Announce presence to other peers
      if (username) {
        announcePresence();
      }
    });

    newPeer.on('error', (error) => {
      console.error('PeerJS error:', error);
      toast.error("Connection error: " + error.message);
      setIsConnected(false);
      
      // If it's a peer unavailable error and we're trying to connect, not create a new ID
      if (error.type === 'peer-unavailable' && customPeerId) {
        toast.error(`Peer ${customPeerId} is not available. Check the token and try again.`);
      }
      
      // If it's a network error, try to reconnect
      if (error.type === 'network' || error.type === 'disconnected') {
        toast.error("Network connection lost. Trying to reconnect...");
        setTimeout(() => {
          createNewPeer(customPeerId);
        }, 3000);
      }
    });

    // Listen for connection events for debugging and device discovery
    newPeer.on('connection', (conn) => {
      console.log("PeerContext: New connection from", conn.peer);
      
      // Handle discovery messages
      conn.on('data', (data: unknown) => {
        // Type guard to check if data is a device announcement
        const isDeviceAnnouncement = 
          typeof data === 'object' && 
          data !== null && 
          'type' in data && 
          (data as any).type === 'device-announcement' && 
          'username' in data && 
          typeof (data as any).username === 'string';
        
        // Type guard to check if data is a chat message
        const isChatMessage = 
          typeof data === 'object' && 
          data !== null && 
          'type' in data && 
          (data as any).type === 'chat-message' && 
          'message' in data && 
          typeof (data as any).message === 'object';
        
        if (isDeviceAnnouncement) {
          const announcementData = data as DeviceAnnouncementData;
          registerDevice(conn.peer, announcementData.username);
          
          // Reply with our own username to let them know we're also online
          if (username) {
            try {
              conn.send({
                type: 'device-announcement',
                username: username
              });
            } catch (err) {
              console.error("Error sending device announcement reply:", err);
            }
          }
        } else if (isChatMessage) {
          // Handle incoming chat message
          const messageData = (data as any).message as ChatMessage;
          
          // Store message in local state
          setChatMessages(prev => {
            const existingMessages = prev[messageData.senderId] || [];
            return {
              ...prev,
              [messageData.senderId]: [...existingMessages, messageData]
            };
          });
          
          // Show notification for new message
          const senderName = onlineDevices.find(d => d.id === messageData.senderId)?.username || messageData.senderName;
          
          // Show a toast notification for the new message
          if (messageData.type === 'text') {
            toast.info(`New message from ${senderName}: ${messageData.content.substring(0, 30)}${messageData.content.length > 30 ? '...' : ''}`);
          } else if (messageData.type === 'file') {
            toast.info(`${senderName} sent you a file: ${messageData.fileData?.name}`);
          } else if (messageData.type === 'token') {
            toast.info(`${senderName} shared a token with you: ${messageData.content}`);
          }
        }
      });
    });

    setPeer(newPeer);
  };

  // Announce presence to the network
  const announcePresence = () => {
    if (!peer || !username) return;
    
    // Get all known peer IDs from onlineDevices
    const peerIds = onlineDevices.map(device => device.id);
    
    // Connect to each peer and announce our presence
    peerIds.forEach(peerId => {
      try {
        const conn = peer.connect(peerId);
        conn.on('open', () => {
          conn.send({
            type: 'device-announcement',
            username: username
          });
        });
      } catch (err) {
        console.error(`Failed to announce to peer ${peerId}:`, err);
      }
    });
    
    console.log("Announced presence to", peerIds.length, "peers");
  };

  // Register a device in our online devices list
  const registerDevice = (deviceId: string, deviceUsername: string) => {
    if (deviceId === peerId) return; // Don't add ourselves
    
    setOnlineDevices(prev => {
      // Check if device already exists
      const exists = prev.some(device => device.id === deviceId);
      if (exists) {
        // Update username if needed
        return prev.map(device => 
          device.id === deviceId 
            ? { ...device, username: deviceUsername } 
            : device
        );
      } else {
        // Add new device
        toast.info(`${deviceUsername} is now online`);
        return [...prev, { id: deviceId, username: deviceUsername }];
      }
    });
  };

  // Clean up and remove disconnected peers periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (peer && username) {
        // Periodically ping known peers to check if they're still online
        onlineDevices.forEach(device => {
          try {
            const conn = peer.connect(device.id);
            let isResponding = false;
            
            conn.on('open', () => {
              isResponding = true;
              conn.send({
                type: 'ping'
              });
              
              // Close connection after sending ping
              setTimeout(() => conn.close(), 1000);
            });
            
            // If connection fails, remove the device
            setTimeout(() => {
              if (!isResponding) {
                setOnlineDevices(prev => 
                  prev.filter(d => d.id !== device.id)
                );
              }
            }, 5000);
          } catch (err) {
            // If connection fails, remove from online devices
            setOnlineDevices(prev => 
              prev.filter(d => d.id !== device.id)
            );
          }
        });
        
        // Re-announce presence periodically
        announcePresence();
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [peer, onlineDevices, username]);

  const destroyPeer = () => {
    if (peer) {
      peer.destroy();
      setPeer(null);
      setPeerId(null);
      setIsConnected(false);
    }
  };

  // Initialize peer on component mount
  useEffect(() => {
    createNewPeer();

    // Cleanup on unmount
    return () => {
      destroyPeer();
    };
  }, []);

  return (
    <PeerContext.Provider
      value={{
        peer,
        peerId,
        isConnected,
        username,
        setUsername,
        onlineDevices,
        createNewPeer,
        destroyPeer,
        announcePresence,
        registerDevice,
        sendChatMessage,
        chatMessages,
        isChatOpen,
        setIsChatOpen,
        activeChatPeer,
        setActiveChatPeer,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
