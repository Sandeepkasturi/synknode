
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { usePeer } from '../context/PeerContext';
import { motion } from 'framer-motion';

const AnimatedWifiSignal: React.FC<{ isConnected: boolean }> = ({ isConnected }) => {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Center dot */}
      <motion.div
        animate={isConnected ? {
          scale: [1, 1.2, 1],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400"
      />
      
      {/* Signal arc 1 - innermost (light blue) */}
      <motion.div
        animate={isConnected ? {
          opacity: [0.3, 1, 0.3],
          scale: [0.8, 1, 0.8],
        } : { opacity: 0.2 }}
        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        className="absolute w-4 h-4"
        style={{
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'transparent',
          borderTopColor: '#67e8f9',
          borderRightColor: '#67e8f9',
          transform: 'rotate(-45deg)',
        }}
      />
      
      {/* Signal arc 2 - middle (green) */}
      <motion.div
        animate={isConnected ? {
          opacity: [0.3, 1, 0.3],
          scale: [0.9, 1.1, 0.9],
        } : { opacity: 0.2 }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        className="absolute w-6 h-6"
        style={{
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'transparent',
          borderTopColor: '#34d399',
          borderRightColor: '#34d399',
          transform: 'rotate(-45deg)',
        }}
      />
      
      {/* Signal arc 3 - outermost (light blue) */}
      <motion.div
        animate={isConnected ? {
          opacity: [0.3, 1, 0.3],
          scale: [1, 1.2, 1],
        } : { opacity: 0.2 }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        className="absolute w-8 h-8"
        style={{
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'transparent',
          borderTopColor: '#67e8f9',
          borderRightColor: '#67e8f9',
          transform: 'rotate(-45deg)',
        }}
      />
    </div>
  );
};

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
          boxShadow: [
            '0 0 0 0 rgba(103, 232, 249, 0.4)',
            '0 0 0 15px rgba(52, 211, 153, 0)',
            '0 0 0 0 rgba(103, 232, 249, 0)'
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={`p-3 rounded-full ${isConnected ? 'bg-gradient-to-br from-cyan-50 to-emerald-50' : 'bg-muted'}`}
      >
        {isConnected ? (
          <AnimatedWifiSignal isConnected={isConnected} />
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
        className={`text-sm font-medium ${isConnected ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent' : 'text-muted-foreground'}`}
      >
        {isConnected ? 'Connected to P2P Network' : 'Connecting...'}
      </motion.span>
    </motion.div>
  );
};
