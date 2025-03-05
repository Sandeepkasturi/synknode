
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

    // Listen for incoming connections
    newPeer.on('connection', (conn) => {
      console.log("New connection from", conn.peer);
      
      // Handle incoming data
      conn.on('data', (data: unknown) => {
        console.log("Received data from peer:", conn.peer, data);
        
        // Handle device announcement messages
        if (isDeviceAnnouncement(data)) {
          const announcementData = data as any;
          registerDevice(conn.peer, announcementData.username);
          
          // Reply with our own username to let them know we're also online
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
        } 
        // Handle chat messages
        else if (isChatMessage(data)) {
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
      
      // Handle connection close
      conn.on('close', () => {
        console.log("Connection closed with peer:", conn.peer);
      });
    });

    setPeer(newPeer);
  };

  // Type guards
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

  // Scan for devices without connecting to them
  const scanForDevices = () => {
    if (!peer || !username || !peerId) {
      console.log("Cannot scan for devices - missing peer, username, or peerId");
      return;
    }
    
    setIsScanning(true);
    console.log("Scanning for devices as:", username);
    
    // Use broker approach with known peer IDs for discovery
    const knownPeerIds = [
      "ABCDE", "12345", "QWERT", "ASDFG", "ZXCVB", 
      "POIUY", "LKJHG", "MNBVC", "98765", "FGHIJ"
    ];
    
    // Filter out our own ID
    const peersToAnnounce = knownPeerIds.filter(id => id !== peerId);
    
    console.log("Announcing to broker peers:", peersToAnnounce);
    
    // Connect to each peer and announce our presence (for discovery only)
    peersToAnnounce.forEach(targetPeerId => {
      try {
        const conn = peer.connect(targetPeerId);
        
        conn.on('open', () => {
          // Send our announcement
          conn.send({
            type: 'device-announcement',
            username: username
          });
        });
      } catch (err) {
        // Silently ignore errors for unavailable peers
      }
    });
    
    // Also announce to previously seen devices to refresh our presence
    onlineDevices.forEach(device => {
      if (device.id !== peerId) {
        try {
          const conn = peer.connect(device.id);
          
          conn.on('open', () => {
            conn.send({
              type: 'device-announcement',
              username: username
            });
          });
        } catch (err) {
          // Silently ignore errors
        }
      }
    });
    
    // Set a timeout to disable the scanning indicator
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  // Register a device in our online devices list
  const registerDevice = (deviceId: string, deviceUsername: string) => {
    if (deviceId === peerId) return; // Don't add ourselves
    
    console.log("Registering device:", deviceId, deviceUsername);
    
    setOnlineDevices(prev => {
      // Check if device already exists
      const exists = prev.some(device => device.id === deviceId);
      if (exists) {
        // Update username if needed
        return prev.map(device => 
          device.id === deviceId 
            ? { ...device, username: deviceUsername, lastSeen: Date.now() } 
            : device
        );
      } else {
        // Add new device
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

  // Clean up and remove disconnected peers periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (peer && username) {
        // Remove devices that haven't been seen for more than 3 minutes
        const THREE_MINUTES = 3 * 60 * 1000;
        setOnlineDevices(prevDevices => {
          const now = Date.now();
          return prevDevices.filter(device => {
            const lastSeen = device.lastSeen || 0;
            return (now - lastSeen) < THREE_MINUTES;
          });
        });
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [peer, username]);

  // Initialize peer on component mount
  useEffect(() => {
    createNewPeer();

    // Cleanup on unmount
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
  };
};
