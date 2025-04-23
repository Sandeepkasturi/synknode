
import React, { createContext, useContext, ReactNode } from "react";
import { usePeerState } from "../hooks/usePeerState";
import { PeerContextType } from "../types/peer.types";

// Create the context with the type
const PeerContext = createContext<PeerContextType>({} as PeerContextType);

// Export the hook for using the peer context
export const usePeer = () => useContext(PeerContext);

// Re-export the generatePeerId function from utils
export { generatePeerId } from "../utils/peer.utils";

// Re-export the ChatMessage type from types
export type { ChatMessage } from "../types/peer.types";

interface PeerProviderProps {
  children: ReactNode;
}

export const PeerProvider: React.FC<PeerProviderProps> = ({ children }) => {
  // Use the hook to get all the peer state and methods
  const peerState = usePeerState();

  return (
    <PeerContext.Provider value={peerState}>
      {children}
    </PeerContext.Provider>
  );
};
