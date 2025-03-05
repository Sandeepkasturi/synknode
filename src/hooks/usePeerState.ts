
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
        // Add a small delay before announcing to ensure the peer connection is fully established
        setTimeout(() => {
          announcePresence();
        }, 1000);
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
        console.log("Received data from peer:", conn.peer, data);
        
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
      
      // Handle connection close
      conn.on('close', () => {
        console.log("Connection closed with peer:", conn.peer);
      });
    });

    setPeer(newPeer);
  };

  // Announce presence to the network - IMPROVED VERSION
  const announcePresence = () => {
    if (!peer || !username || !peerId) {
      console.log("Cannot announce presence - missing peer, username, or peerId");
      return;
    }
    
    console.log("Announcing presence to the network as:", username);
    
    // Use a central peer/broker approach
    // In a real app, this would be a server, but for this demo, we're using known peer IDs
    const knownPeerIds = [
      "ABCDE", "12345", "QWERT", "ASDFG", "ZXCVB", 
      "POIUY", "LKJHG", "MNBVC", "98765", "FGHIJ"
    ];
    
    // Announce to all known peers plus any we've seen before
    const allPeers = [...new Set([...knownPeerIds, ...onlineDevices.map(d => d.id)])];
    
    // Filter out our own ID
    const peersToAnnounce = allPeers.filter(id => id !== peerId);
    
    console.log("Will try to announce to these peers:", peersToAnnounce);
    
    // Connect to each peer and announce our presence
    peersToAnnounce.forEach(targetPeerId => {
      try {
        console.log("Attempting to connect to peer:", targetPeerId);
        const conn = peer.connect(targetPeerId);
        
        conn.on('open', () => {
          console.log("Connection opened to peer:", targetPeerId);
          // Send our announcement
          conn.send({
            type: 'device-announcement',
            username: username
          });
        });
        
        conn.on('error', (err) => {
          console.error(`Error connecting to peer ${targetPeerId}:`, err);
        });
      } catch (err) {
        console.error(`Failed to announce to peer ${targetPeerId}:`, err);
      }
    });
    
    // Also broadcast to any random IDs we generate - this improves discovery
    // Random 3-digit number for broadcasting to random peers
    for (let i = 0; i < 5; i++) {
      const randomChar1 = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
      const randomChar2 = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
      const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const randomPeerId = randomChar1 + randomChar2 + randomNumber;
      
      try {
        console.log("Attempting to connect to random peer:", randomPeerId);
        const conn = peer.connect(randomPeerId);
        
        conn.on('open', () => {
          console.log("Connection opened to random peer:", randomPeerId);
          conn.send({
            type: 'device-announcement',
            username: username
          });
        });
      } catch (err) {
        // Ignore errors for random peers
      }
    }
    
    console.log("Finished announcing presence");
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
        // Remove devices that haven't been seen for more than 2 minutes
        const TWO_MINUTES = 2 * 60 * 1000;
        setOnlineDevices(prevDevices => {
          const now = Date.now();
          return prevDevices.filter(device => {
            const lastSeen = device.lastSeen || 0;
            return (now - lastSeen) < TWO_MINUTES;
          });
        });
        
        // Announce presence periodically
        announcePresence();
      }
    }, 15000); // Every 15 seconds instead of 30
    
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
    announcePresence,
    registerDevice,
    sendChatMessage,
    chatMessages,
    isChatOpen,
    setIsChatOpen,
    activeChatPeer,
    setActiveChatPeer,
  };
};
