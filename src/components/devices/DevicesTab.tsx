
import React, { useState, useEffect } from 'react';
import { usePeer } from '@/context/PeerContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DevicesList } from './DevicesList';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import { ChatInterface } from './ChatInterface';

export const DevicesTab: React.FC = () => {
  const { 
    username, 
    announcePresence, 
    setIsChatOpen, 
    isChatOpen, 
    activeChatPeer, 
    setActiveChatPeer 
  } = usePeer();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoScanning, setIsAutoScanning] = useState(true);

  // Auto-scan for devices every 5 seconds
  useEffect(() => {
    if (isAutoScanning && !isChatOpen) {
      const interval = setInterval(() => {
        announcePresence();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isAutoScanning, isChatOpen, announcePresence]);

  // Initial scan on mount
  useEffect(() => {
    announcePresence();
  }, [announcePresence]);

  const handleConnect = (deviceId: string) => {
    setActiveChatPeer(deviceId);
    setIsChatOpen(true);
    toast.info(`Opening chat with ${deviceId}...`);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveChatPeer(null);
  };

  const refreshDevices = () => {
    setIsRefreshing(true);
    announcePresence();
    toast.info("Scanning for nearby devices...");
    
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <AnimatePresence mode="wait">
      {!isChatOpen ? (
        <motion.div 
          key="devices-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Nearby Devices
            </h2>
            <p className="text-sm text-muted-foreground">
              Automatically discovering devices on your network
            </p>
          </motion.div>

          <DevicesList 
            handleConnect={handleConnect}
            isRefreshing={isRefreshing}
            refreshDevices={refreshDevices}
            isAutoScanning={isAutoScanning}
          />
          
          <DeviceStatusBadge />
        </motion.div>
      ) : (
        <motion.div 
          key="chat-interface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full flex flex-col"
        >
          <ChatInterface onClose={handleCloseChat} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
