
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
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    broadcast: []
  });
  const [isScanning, setIsScanning] = useState(false);

  // Store messages in localStorage to persist them
  useEffect(() => {
    if (chatMessages.broadcast && chatMessages.broadcast.length > 0) {
      localStorage.setItem('p2p_broadcast_messages', JSON.stringify(chatMessages.broadcast));
    }
  }, [chatMessages.broadcast]);

  // Load messages from localStorage on init
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('p2p_broadcast_messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as ChatMessage[];
        setChatMessages(prev => ({
          ...prev,
          broadcast: parsedMessages
        }));
      }
    } catch (err) {
      console.error('Error loading saved messages:', err);
    }
  }, []);

  useEffect(() => {
    if (username) {
      localStorage.setItem('p2p_username', username);
    }
  }, [username]);

  const broadcastData = (data: any) => {
    if (!peer || !peerId) {
      toast.error("Not connected to the network");
      return;
    }

    console.log("Broadcasting data to all peers:", data);

    onlineDevices.forEach(device => {
      if (device.id === peerId) return; // Skip self
      try {
        const conn = peer.connect(device.id);
        
        conn.on('open', () => {
          conn.send(data);
          console.log(`Sent data to peer ${device.id}`, data);
          
          setTimeout(() => {
            conn.close();
          }, 2000);
        });
        
        conn.on('error', (err) => {
          console.error('Error broadcasting to peer:', err);
          setOnlineDevices(prev => prev.filter(d => d.id !== device.id));
        });
      } catch (err) {
        console.error('Error connecting to peer for broadcast:', err);
      }
    });
  };

  const broadcastMessage = (content: string, type: 'text' | 'file' | 'token' = 'text', fileData?: any) => {
    if (!peer || !peerId || !username) {
      toast.error("Not connected to the network");
      return;
    }

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: peerId,
      senderName: username,
      receiverId: 'broadcast',
      content,
      timestamp: Date.now(),
      type,
      ...(fileData && { fileData })
    };

    // Add message to local state first
    setChatMessages(prev => {
      const existingMessages = prev['broadcast'] || [];
      return {
        ...prev,
        broadcast: [...existingMessages, message]
      };
    });

    // Then broadcast to all peers
    broadcastData({
      type: 'broadcast-message',
      message
    });

    console.log("Broadcast message sent to all users", message);
    return message;
  };

  const sendChatMessage = (receiverId: string | 'broadcast', content: string, type: 'text' | 'file' | 'token' = 'text', fileData?: any) => {
    if (!peer || !peerId || !username) {
      toast.error("Not connected to the network");
      return;
    }

    if (receiverId === 'broadcast') {
      return broadcastMessage(content, type, fileData);
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
        return message;
      });

      conn.on('error', (err) => {
        console.error('Error sending message:', err);
        toast.error("Failed to send message. User may be offline.");
        return null;
      });
    } catch (err) {
      console.error('Error connecting to peer:', err);
      toast.error("Failed to connect to user");
      return null;
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

      setTimeout(() => {
        if (username) {
          // Register self in online devices for easier tracking
          registerDevice(finalId, username);
          // Then announce presence to others
          announcePresence();
          // And scan for other devices
          scanForDevices();
        }
      }, 1000);
    });

    newPeer.on('error', (error) => {
      console.error('PeerJS error:', error);
      
      if (error.type !== 'peer-unavailable' || !isScanning) {
        toast.error("Connection error: " + error.message);
      }
      
      if (error.type === 'network' || error.type === 'disconnected') {
        toast.error("Network connection lost. Trying to reconnect...");
        setTimeout(() => {
          createNewPeer(customPeerId);
        }, 3000);
      }
    });

    newPeer.on('connection', (conn) => {
      console.log("New connection from", conn.peer);
      
      // Handle incoming data
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
              
              // Send the new peer our message history
              if (chatMessages.broadcast && chatMessages.broadcast.length > 0) {
                console.log("Sending message history to new peer:", conn.peer);
                conn.send({
                  type: 'message-history',
                  messages: chatMessages.broadcast
                });
              }
            } catch (err) {
              console.error("Error sending device announcement reply:", err);
            }
          }
        } else if (isChatMessage(data)) {
          const messageData = (data as any).message as ChatMessage;
          
          setChatMessages(prev => {
            const existingMessages = prev[messageData.senderId] || [];
            // Check if message already exists to avoid duplicates
            if (existingMessages.some(m => m.id === messageData.id)) {
              return prev;
            }
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
        } else if (isBroadcastMessage(data)) {
          const messageData = (data as any).message as ChatMessage;
          
          if (messageData.senderId !== peerId) {
            console.log("Received broadcast message:", messageData);
            
            setChatMessages(prev => {
              const existingMessages = prev['broadcast'] || [];
              const exists = existingMessages.some(msg => msg.id === messageData.id);
              if (exists) {
                return prev;
              }
              
              // Add the message and re-broadcast to ensure everyone gets it
              setTimeout(() => {
                broadcastData({
                  type: 'broadcast-message',
                  message: messageData
                });
              }, 500);
              
              return {
                ...prev,
                broadcast: [...existingMessages, messageData]
              };
            });
            
            const senderName = onlineDevices.find(d => d.id === messageData.senderId)?.username || messageData.senderName;
            
            if (messageData.type === 'text') {
              toast.info(`Broadcast from ${senderName}: ${messageData.content.substring(0, 30)}${messageData.content.length > 30 ? '...' : ''}`);
            } else if (messageData.type === 'file') {
              toast.info(`${senderName} shared a file with everyone: ${messageData.fileData?.name || 'unnamed file'}`);
            } else if (messageData.type === 'token') {
              toast.info(`${senderName} shared a token with everyone: ${messageData.content}`);
            }
          }
        } else if (isMessageHistory(data)) {
          const historyData = (data as any).messages as ChatMessage[];
          console.log("Received message history:", historyData);
          
          if (Array.isArray(historyData) && historyData.length > 0) {
            setChatMessages(prev => {
              const existingMessages = prev['broadcast'] || [];
              const newMessages = historyData.filter(
                newMsg => !existingMessages.some(oldMsg => oldMsg.id === newMsg.id)
              );
              
              if (newMessages.length === 0) {
                return prev;
              }
              
              return {
                ...prev,
                broadcast: [...existingMessages, ...newMessages].sort((a, b) => a.timestamp - b.timestamp)
              };
            });
            
            toast.info(`Received ${historyData.length} messages from chat history`);
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

  const isBroadcastMessage = (data: unknown): boolean => {
    return (
      typeof data === 'object' && 
      data !== null && 
      'type' in data && 
      (data as any).type === 'broadcast-message' && 
      'message' in data && 
      typeof (data as any).message === 'object'
    );
  };

  const isMessageHistory = (data: unknown): boolean => {
    return (
      typeof data === 'object' && 
      data !== null && 
      'type' in data && 
      (data as any).type === 'message-history' && 
      'messages' in data && 
      Array.isArray((data as any).messages)
    );
  };

  const scanForDevices = () => {
    if (!peer || !username || !peerId) {
      console.log("Cannot scan for devices - missing peer, username, or peerId");
      return;
    }
    
    setIsScanning(true);
    console.log("Scanning for devices as:", username);

    const brokerPeers = ["ABCDE", "12345", "QWERT", "HELLO", "CHAT1", "WORLD"];
    
    // Connect to broker peers first to increase chance of discovery
    brokerPeers.forEach(brokerPeerId => {
      if (brokerPeerId === peerId) return;
      
      try {
        console.log("Announcing to broker:", brokerPeerId);
        const conn = peer.connect(brokerPeerId);
        
        conn.on('open', () => {
          conn.send({
            type: 'device-announcement',
            username: username
          });
          
          setTimeout(() => {
            conn.close();
          }, 500);
        });
        
        conn.on('error', (err) => {
          console.log("Broker unavailable:", brokerPeerId);
        });
      } catch (err) {
        console.log("Failed to connect to broker:", brokerPeerId);
      }
    });
    
    // Also connect to all known devices
    onlineDevices.forEach(device => {
      if (device.id === peerId) return;
      
      try {
        console.log("Announcing to device:", device.id);
        const conn = peer.connect(device.id);
        
        conn.on('open', () => {
          conn.send({
            type: 'device-announcement',
            username: username
          });
          
          setTimeout(() => {
            conn.close();
          }, 500);
        });
        
        conn.on('error', (err) => {
          console.log("Device unavailable:", device.id);
          setOnlineDevices(prev => prev.filter(d => d.id !== device.id));
        });
      } catch (err) {
        console.log("Failed to connect to device:", device.id);
      }
    });
    
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
    
    // Using more broker peers to increase chance of connection
    const brokerPeers = ["ABCDE", "12345", "QWERT", "HELLO", "CHAT1", "WORLD"];
    
    brokerPeers.forEach(brokerPeerId => {
      if (brokerPeerId === peerId) return;
      
      try {
        const conn = peer.connect(brokerPeerId);
        
        conn.on('open', () => {
          conn.send({
            type: 'device-announcement',
            username: username
          });
          
          setTimeout(() => {
            conn.close();
          }, 500);
        });
      } catch (err) {
        // Silently ignore errors
      }
    });
    
    // Also announce to all known devices
    onlineDevices.forEach(device => {
      if (device.id === peerId) return;
      
      try {
        const conn = peer.connect(device.id);
        
        conn.on('open', () => {
          conn.send({
            type: 'device-announcement',
            username: username
          });
          
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
        if (deviceId !== peerId) {
          toast.info(`${deviceUsername} is now online`);
        }
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

  // Clean up old devices periodically
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

  // Create initial peer on component mount
  useEffect(() => {
    createNewPeer();

    return () => {
      destroyPeer();
    };
  }, []);

  // Periodically scan for devices when we have a username
  useEffect(() => {
    if (username) {
      scanForDevices();
      
      const intervalId = setInterval(() => {
        if (username && peer) {
          scanForDevices();
          announcePresence();
        }
      }, 15000); // Scan more frequently
      
      return () => clearInterval(intervalId);
    }
  }, [username, peer]);

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
    announcePresence,
    broadcastMessage,
    broadcastData,
  };
};
