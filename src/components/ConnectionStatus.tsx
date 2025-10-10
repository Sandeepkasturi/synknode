
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { usePeer } from '../context/PeerContext';
import { motion } from 'framer-motion';

export const ConnectionStatus: React.FC = () => {
  const { isConnected } = usePeer();

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center gap-3 mb-8"
    >
      <motion.div
        animate={isConnected ? {
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 0 0 rgba(var(--primary), 0.4)',
            '0 0 0 10px rgba(var(--primary), 0)',
            '0 0 0 0 rgba(var(--primary), 0)'
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={`p-2 rounded-full ${isConnected ? 'bg-primary/20' : 'bg-muted'}`}
      >
        {isConnected ? (
          <Wifi className="w-5 h-5 text-primary" />
        ) : (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <WifiOff className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        )}
      </motion.div>
      <motion.span
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`text-sm font-medium ${isConnected ? 'text-primary' : 'text-muted-foreground'}`}
      >
        {isConnected ? 'Connected to P2P Network' : 'Connecting...'}
      </motion.span>
    </motion.div>
  );
};
