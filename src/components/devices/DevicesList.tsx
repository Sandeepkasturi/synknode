
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { usePeer } from '@/context/PeerContext';
import { useFileTransfer } from '@/context/FileTransferContext';
import { Laptop, User, Share2, RefreshCw, Users, Shield, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Animation variants
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

interface DevicesListProps {
  handleConnect: (deviceId: string) => void;
  isRefreshing: boolean;
  refreshDevices: () => void;
}

export const DevicesList: React.FC<DevicesListProps> = ({ 
  handleConnect, 
  isRefreshing, 
  refreshDevices 
}) => {
  const { onlineDevices, peerId, username, announcePresence } = usePeer();
  const { handlePeerConnect } = useFileTransfer();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleRefresh = () => {
    refreshDevices();
    setLastRefresh(new Date());
  };

  useEffect(() => {
    // When this component mounts, force a refresh
    handleRefresh();
  }, []);

  return (
    <>
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
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Device info alert */}
      <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
        <Users className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-800">Your device info</AlertTitle>
        <AlertDescription className="text-blue-700">
          <div className="flex flex-col gap-1 mt-2 text-xs">
            <div><strong>Username:</strong> {username || 'Not set'}</div>
            <div><strong>Device ID:</strong> {peerId || 'Not connected'}</div>
            <div><strong>Last refresh:</strong> {lastRefresh.toLocaleTimeString()}</div>
          </div>
        </AlertDescription>
      </Alert>

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
              onClick={handleRefresh}
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
                <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-400 to-purple-500">
                  <AvatarFallback>{getInitials(device.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{device.username}</h3>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-500">ID: {device.id}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedDevice(device.id);
                    handleConnect(device.id);
                  }}
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handlePeerConnect(device.id)}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
};
