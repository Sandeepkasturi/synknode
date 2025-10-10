
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { usePeer } from '../context/PeerContext';

export const ConnectionStatus: React.FC = () => {
  const { isConnected } = usePeer();

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <div className={`p-1.5 rounded-full ${isConnected ? 'bg-primary/20' : 'bg-muted'}`}>
        {isConnected ? (
          <Wifi className="w-4 h-4 text-primary" />
        ) : (
          <WifiOff className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      <span className={`text-sm font-medium ${isConnected ? 'text-primary' : 'text-muted-foreground'}`}>
        {isConnected ? 'Connected to P2P Network' : 'Connecting...'}
      </span>
    </div>
  );
};
