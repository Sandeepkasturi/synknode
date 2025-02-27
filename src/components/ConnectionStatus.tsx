
import React from 'react';
import { Wifi } from 'lucide-react';
import { usePeer } from '../context/PeerContext';

export const ConnectionStatus: React.FC = () => {
  const { isConnected } = usePeer();

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <Wifi className={`w-5 h-5 ${isConnected ? 'text-success' : 'text-gray-400'}`} />
      <span className={`text-sm ${isConnected ? 'text-success' : 'text-gray-400'}`}>
        {isConnected ? 'Connected to P2P Network' : 'Connecting...'}
      </span>
    </div>
  );
};
