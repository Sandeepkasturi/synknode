
import { useState, useEffect } from "react";
import Peer from "peerjs";
import { toast } from "sonner";
import { generatePeerId } from "../utils/peer.utils";
import { ChatMessage, OnlineDevice } from "../types/peer.types";

export const usePeerState = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('p2p_username');
  });
  const [onlineDevices, setOnlineDevices] = useState<OnlineDevice[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatPeer, setActiveChatPeer] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (username) {
      localStorage.setItem('p2p_username', username);
    }
  }, [username]);

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

        conn.send({
          type: 'chat-message',
          message
        });

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
    if (peer) {
      peer.destroy();
    }

    const newPeerId = customPeerId || generatePeerId();
    
    console.log("Creating new peer with ID:", newPeerId);
    
    const newPeer = new Peer(newPeerId, {
      debug: 3,
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
      
      const finalId = id.length !== 5 ? newPeerId : id;
      
      setPeerId(finalId);
      setIsConnected(true);
      
      if (!isConnected || customPeerId) {
        toast.success("Connected to P2P network!");
      }
    });

    newPeer.on('error', (error) => {
      console.error('PeerJS error:', error);
      
      // Only show errors that aren't related to peer unavailability during scanning
      if (error.type !== 'peer-unavailable' || !isScanning) {
        toast.error("Connection error: " + error.message);
      }
      
      if (error.type === 'network' || error.type === 'disconnected') {
        toast.error("Network connection lost. Trying to reconnect...");
        setTimeout(() => {
          createNewPeer(customPeerId);
        }, 3000);
      }
      
      setIsConnected(false);
    });

    newPeer.on('connection', (conn) => {
      console.log("New connection from", conn.peer);
      
      conn.on('data', (data: unknown) => {
        console.log("Received data from peer:", conn.peer, data);
        
        if (isDeviceAnnouncement(data)) {
          const announcementData = data as any;
          registerDevice(conn.peer, announcementData.username);
          
          if (username) {
            try {
              console.log("Sending announcement reply to:", conn.peer);
              conn.send({
                type: 'device-announcement',
                username: username
              });
            } catch (err) {
              console.error("Error sending device announcement reply:", err);
            }
          }
        } else if (isChatMessage(data)) {
          const messageData = (data as any).message as ChatMessage;
          
          setChatMessages(prev => {
            const existingMessages = prev[messageData.senderId] || [];
            return {
              ...prev,
              [messageData.senderId]: [...existingMessages, messageData]
            };
          });
          
          const senderName = onlineDevices.find(d => d.id === messageData.senderId)?.username || messageData.senderName;
          
          if (messageData.type === 'text') {
            toast.info(`New message from ${senderName}: ${messageData.content.substring(0, 30)}${messageData.content.length > 30 ? '...' : ''}`);
          } else if (messageData.type === 'file') {
            toast.info(`${senderName} sent you a file: ${messageData.fileData?.name}`);
          } else if (messageData.type === 'token') {
            toast.info(`${senderName} shared a token with you: ${messageData.content}`);
          }
        }
      });
      
      conn.on('close', () => {
        console.log("Connection closed with peer:", conn.peer);
      });
    });

    setPeer(newPeer);
  };

  const isDeviceAnnouncement = (data: unknown): boolean => {
    return (
      typeof data === 'object' && 
      data !== null && 
      'type' in data && 
      (data as any).type === 'device-announcement' && 
      'username' in data && 
      typeof (data as any).username === 'string'
    );
  };
  
  const isChatMessage = (data: unknown): boolean => {
    return (
      typeof data === 'object' && 
      data !== null && 
      'type' in data && 
      (data as any).type === 'chat-message' && 
      'message' in data && 
      typeof (data as any).message === 'object'
    );
  };

  // Modified to use a central announcement server instead of direct connections during scanning
  const scanForDevices = () => {
    if (!peer || !username || !peerId) {
      console.log("Cannot scan for devices - missing peer, username, or peerId");
      return;
    }
    
    setIsScanning(true);
    console.log("Scanning for devices as:", username);

    // Use a list of known "broker" peers that act as discovery servers
    const brokerPeers = ["ABCDE", "12345", "QWERT"];
    
    // Send our presence to the broker servers only
    brokerPeers.forEach(brokerPeerId => {
      if (brokerPeerId === peerId) return; // Skip self
      
      try {
        console.log("Announcing to broker:", brokerPeerId);
        // Connect only to the broker peers
        const conn = peer.connect(brokerPeerId);
        
        conn.on('open', () => {
          // Send presence announcement
          conn.send({
            type: 'device-announcement',
            username: username
          });
          
          // Immediately close connection after announcing
          setTimeout(() => {
            conn.close();
          }, 500);
        });
        
        // Don't show error toasts for broker connections
        conn.on('error', (err) => {
          console.log("Broker unavailable:", brokerPeerId);
        });
      } catch (err) {
        // Silently ignore broker connection errors
        console.log("Failed to connect to broker:", brokerPeerId);
      }
    });
    
    // Set a timeout to end the scanning state
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  const announcePresence = () => {
    if (!peer || !username || !peerId) {
      console.log("Cannot announce presence - missing peer, username, or peerId");
      return;
    }
    
    console.log("Announcing presence as:", username);
    
    // Only use broker peers for announcements
    const brokerPeers = ["ABCDE", "12345", "QWERT"];
    
    brokerPeers.forEach(brokerPeerId => {
      if (brokerPeerId === peerId) return; // Skip self
      
      try {
        const conn = peer.connect(brokerPeerId);
        
        conn.on('open', () => {
          conn.send({
            type: 'device-announcement',
            username: username
          });
          
          // Close connection after announcing
          setTimeout(() => {
            conn.close();
          }, 500);
        });
      } catch (err) {
        // Silently ignore errors
      }
    });
  };

  const registerDevice = (deviceId: string, deviceUsername: string) => {
    if (deviceId === peerId) return;
    
    console.log("Registering device:", deviceId, deviceUsername);
    
    setOnlineDevices(prev => {
      const exists = prev.some(device => device.id === deviceId);
      if (exists) {
        return prev.map(device => 
          device.id === deviceId 
            ? { ...device, username: deviceUsername, lastSeen: Date.now() } 
            : device
        );
      } else {
        toast.info(`${deviceUsername} is now online`);
        return [...prev, { id: deviceId, username: deviceUsername, lastSeen: Date.now() }];
      }
    });
  };

  const destroyPeer = () => {
    if (peer) {
      peer.destroy();
      setPeer(null);
      setPeerId(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (peer && username) {
        const THREE_MINUTES = 3 * 60 * 1000;
        setOnlineDevices(prevDevices => {
          const now = Date.now();
          return prevDevices.filter(device => {
            const lastSeen = device.lastSeen || 0;
            return (now - lastSeen) < THREE_MINUTES;
          });
        });
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [peer, username]);

  useEffect(() => {
    createNewPeer();

    return () => {
      destroyPeer();
    };
  }, []);

  return {
    peer,
    peerId,
    isConnected,
    username,
    setUsername,
    onlineDevices,
    createNewPeer,
    destroyPeer,
    scanForDevices,
    isScanning,
    registerDevice,
    sendChatMessage,
    chatMessages,
    isChatOpen,
    setIsChatOpen,
    activeChatPeer,
    setActiveChatPeer,
    announcePresence,
  };
};
