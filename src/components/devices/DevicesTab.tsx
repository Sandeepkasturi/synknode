
import React, { useState, useEffect } from 'react';
import { usePeer } from '@/context/PeerContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DevicesList } from './DevicesList';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import { ChatInterface } from './ChatInterface';
import { Filter, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnlineDevice } from '@/types/peer.types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

export const DevicesTab: React.FC = () => {
  const { 
    username, 
    scanForDevices, 
    setIsChatOpen, 
    isChatOpen, 
    activeChatPeer, 
    setActiveChatPeer,
    onlineDevices,
    peerId,
    isScanning
  } = usePeer();

  const [filterType, setFilterType] = useState<'all' | 'same-network' | 'different-network'>('all');
  const [filteredDevices, setFilteredDevices] = useState<OnlineDevice[]>(onlineDevices);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredDevices(onlineDevices);
    } else if (filterType === 'same-network') {
      // This is a simple simulation - in a real app you'd use IP address matching
      // For now we'll consider devices with IDs starting with the same letter as "same network"
      const firstChar = peerId?.charAt(0) || '';
      setFilteredDevices(
        onlineDevices.filter(device => device.id.charAt(0) === firstChar)
      );
    } else if (filterType === 'different-network') {
      const firstChar = peerId?.charAt(0) || '';
      setFilteredDevices(
        onlineDevices.filter(device => device.id.charAt(0) !== firstChar)
      );
    }
  }, [onlineDevices, filterType, peerId]);

  // Connect to a device only when user specifically clicks on it
  const handleConnect = (deviceId: string) => {
    setActiveChatPeer(deviceId);
    setIsChatOpen(true);
    toast.info(`Opening chat with ${onlineDevices.find(d => d.id === deviceId)?.username || deviceId}...`);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveChatPeer(null);
  };

  const refreshDevices = () => {
    if (username) {
      toast.info("Scanning for devices...");
      scanForDevices();
    } else {
      toast.error("Please set a username first");
    }
  };

  // Scan for devices when the component mounts
  useEffect(() => {
    if (username) {
      refreshDevices();
    }
    
    // Set up periodic scanning at a reasonable interval
    const intervalId = setInterval(() => {
      if (username) {
        scanForDevices();
      }
    }, 60000); // Once per minute is enough
    
    return () => clearInterval(intervalId);
  }, [username]);

  return (
    <AnimatePresence mode="wait">
      {!isChatOpen ? (
        <motion.div 
          key="devices-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6 animate-fade-up"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-gray-900">Available Devices</h2>
            <p className="text-sm text-gray-500 mt-1">
              Connect to another device to chat and share files
            </p>
          </div>

          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-sm">
                {filteredDevices.length} {filteredDevices.length === 1 ? 'device' : 'devices'} found
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    <Filter className="h-3.5 w-3.5" />
                    {!isMobile && (
                      <span className="text-xs">
                        {filterType === 'all' ? 'All Networks' : 
                         filterType === 'same-network' ? 'Same Network' : 'Different Network'}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterType('all')}>
                    All Networks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('same-network')}>
                    Same Network
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('different-network')}>
                    Different Network
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshDevices}
                className="flex items-center gap-2 h-8 px-3"
                disabled={isScanning}
              >
                <RefreshCw className={`h-3 w-3 ${isScanning ? 'animate-spin' : ''}`} />
                {!isMobile && <span>{isScanning ? 'Scanning...' : 'Scan'}</span>}
              </Button>
            </div>
          </div>

          <DevicesList 
            devices={filteredDevices}
            handleConnect={handleConnect}
            isRefreshing={isScanning}
            refreshDevices={refreshDevices}
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
