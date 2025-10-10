
import { useState, useEffect } from "react";
import Peer from "peerjs";
import { toast } from "sonner";
import { generatePeerId } from "../utils/peer.utils";
import { ChatMessage, OnlineDevice } from "../types/peer.types";
import { usePresenceChannel } from "./usePresenceChannel";

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

  // Use presence channel for automatic device discovery
  const { onlineUsers } = usePresenceChannel(peerId, username);

  // Sync presence users with onlineDevices
  useEffect(() => {
    const devices: OnlineDevice[] = onlineUsers.map(user => ({
      id: user.peerId,
      username: user.username
    }));
    setOnlineDevices(devices);
  }, [onlineUsers]);

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
      
      // Presence is now automatically tracked via usePresenceChannel hook
      console.log("Presence will be tracked automatically");
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

    // Listen for connection events for chat messages
    newPeer.on('connection', (conn) => {
      console.log("P2P connection from", conn.peer);
      
      conn.on('data', (data: unknown) => {
        // Type guard to check if data is a chat message
        const isChatMessage = 
          typeof data === 'object' && 
          data !== null && 
          'type' in data && 
          (data as any).type === 'chat-message' && 
          'message' in data && 
          typeof (data as any).message === 'object';
        
        if (isChatMessage) {
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

  // Legacy functions kept for compatibility
  const announcePresence = () => {
    // Presence is now handled automatically by usePresenceChannel
    console.log("Presence tracking is automatic via Lovable Cloud");
  };

  const registerDevice = (deviceId: string, deviceUsername: string) => {
    // Device registration is now handled automatically by usePresenceChannel
    console.log("Device registration is automatic via Lovable Cloud");
  };

  const destroyPeer = () => {
    if (peer) {
      peer.destroy();
      setPeer(null);
      setPeerId(null);
      setIsConnected(false);
    }
  };

  // Presence tracking is now handled automatically by Lovable Cloud
  // No need for periodic pinging or manual announcements

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
