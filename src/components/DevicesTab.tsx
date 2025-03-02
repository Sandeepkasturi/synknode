
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { usePeer } from '@/context/PeerContext';
import { useFileTransfer } from '@/context/FileTransferContext';
import { Laptop, User, Share2, RefreshCw, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const DevicesTab: React.FC = () => {
  const { onlineDevices, username, peerId, announcePresence } = usePeer();
  const { handlePeerConnect } = useFileTransfer();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConnect = (deviceId: string) => {
    setSelectedDevice(deviceId);
    handlePeerConnect(deviceId);
    toast.info(`Connecting to ${onlineDevices.find(d => d.id === deviceId)?.username || deviceId}...`);
  };

  const refreshDevices = () => {
    setIsRefreshing(true);
    announcePresence();
    toast.info("Scanning for devices...");
    
    // Reset refreshing state after animation completes
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Animation variants for list items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">Available Devices</h2>
        <p className="text-sm text-gray-500 mt-1">
          Connect directly to another device to share files
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <span className="font-medium text-sm">
            {onlineDevices.length} {onlineDevices.length === 1 ? 'device' : 'devices'} found
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshDevices}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {onlineDevices.length === 0 ? (
        <div className="text-center py-10 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg border border-dashed border-gray-300">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Laptop className="mx-auto h-12 w-12 text-indigo-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Waiting for other devices to come online
            </p>
            <Button 
              variant="outline"
              size="sm" 
              onClick={refreshDevices}
              className="mt-4"
            >
              Scan for devices
            </Button>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          className="grid gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {onlineDevices.map((device) => (
            <motion.div 
              key={device.id}
              variants={itemVariants}
              className={`flex items-center justify-between p-4 
                ${selectedDevice === device.id 
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md' 
                  : 'bg-white hover:bg-gray-50'
                } rounded-lg border transition-all duration-200 hover:shadow-sm`}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{device.username}</h3>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-500">ID: {device.id}</p>
                  </div>
                </div>
              </div>
              <Button 
                size="sm"
                onClick={() => handleConnect(device.id)}
                disabled={selectedDevice === device.id}
                className={`
                  flex items-center gap-1
                  ${selectedDevice === device.id 
                    ? 'bg-indigo-400 hover:bg-indigo-500' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                  }
                `}
              >
                <Share2 className="h-4 w-4 mr-1" />
                {selectedDevice === device.id ? 'Connecting...' : 'Connect'}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Online status */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 shadow-sm">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-gray-700">
            Online as <span className="font-medium text-indigo-800">{username || 'Anonymous'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
