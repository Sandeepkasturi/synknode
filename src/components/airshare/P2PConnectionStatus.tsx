
import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { usePeer } from '@/context/PeerContext';

export const P2PConnectionStatus: React.FC = () => {
  const { isConnected, peerId } = usePeer();

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white border">
        <div className={`p-1.5 rounded-full ${isConnected ? 'bg-green-50' : 'bg-gray-100'}`}>
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
          {isConnected 
            ? `Connected to P2P Network (${peerId})` 
            : 'Connecting to P2P Network...'}
        </span>
      </div>
    </div>
  );
};
