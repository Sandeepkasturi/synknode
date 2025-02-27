
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

interface PeerContextType {
  peer: Peer | null;
  peerId: string | null;
  isConnected: boolean;
  createNewPeer: (customPeerId?: string) => void;
  destroyPeer: () => void;
}

const PeerContext = createContext<PeerContextType>({
  peer: null,
  peerId: null,
  isConnected: false,
  createNewPeer: () => {},
  destroyPeer: () => {},
});

export const usePeer = () => useContext(PeerContext);

interface PeerProviderProps {
  children: ReactNode;
}

export const PeerProvider: React.FC<PeerProviderProps> = ({ children }) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const createNewPeer = (customPeerId?: string) => {
    // Destroy existing peer if it exists
    if (peer) {
      peer.destroy();
    }

    // Create a new peer with optional custom ID
    const newPeerId = customPeerId || generatePeerId();
    
    // Create new peer instance
    const newPeer = new Peer(newPeerId);

    newPeer.on('open', (id) => {
      console.log('Connected to P2P network with ID:', id);
      
      // If the id returned is not 5 characters, regenerate
      const finalId = id.length !== 5 ? newPeerId : id;
      
      setPeerId(finalId);
      setIsConnected(true);
      toast.success("Connected to P2P network!");
    });

    newPeer.on('error', (error) => {
      console.error('PeerJS error:', error);
      toast.error("Connection error. Please try again.");
      setIsConnected(false);
    });

    setPeer(newPeer);
  };

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
        createNewPeer,
        destroyPeer,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
