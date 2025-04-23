
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { usePeer } from '../context/PeerContext';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, peerId } = usePeer();

  return (
    <div className="flex items-center justify-center gap-2">
      <div className={`p-1.5 rounded-full ${isConnected ? 'bg-brand-green/10' : 'bg-gray-200'}`}>
        {isConnected ? (
          <Wifi className="w-4 h-4 text-brand-green" />
        ) : (
          <WifiOff className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <span className={`text-sm font-medium ${isConnected ? 'text-brand-green' : 'text-gray-400'}`}>
        {isConnected ? `Connected to P2P Network (${peerId})` : 'Connecting...'}
      </span>
    </div>
  );
};
