import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useFileTransfer } from '@/context/FileTransferContext';
import { Shield, MessageSquare, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OnlineDevice } from '@/types/peer.types';

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
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

interface DevicesListProps {
  devices: OnlineDevice[];
  handleConnect: (deviceId: string) => void;
  isRefreshing: boolean;
  refreshDevices: () => void;
}

export const DevicesList: React.FC<DevicesListProps> = ({ 
  devices, 
  handleConnect, 
  isRefreshing, 
  refreshDevices 
}) => {
  const { handlePeerConnect } = useFileTransfer();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="bg-white/50 rounded-lg p-4 border border-white/60">
      {devices.length === 0 ? (
        <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg border border-dashed border-gray-300">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <User className="mx-auto h-10 w-10 text-indigo-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
            <p className="mt-1 text-xs text-gray-500">
              {isRefreshing ? 'Scanning for devices...' : 'No other users are online right now'}
            </p>
            <Button 
              variant="outline"
              size="sm" 
              onClick={refreshDevices}
              className="mt-3 h-8"
            >
              Scan for devices
            </Button>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          className="grid gap-3 mt-1"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {devices.map((device) => (
            <motion.div 
              key={device.id}
              variants={itemVariants}
              className={`flex items-center justify-between p-3 
                ${selectedDevice === device.id 
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-sm' 
                  : 'bg-white hover:bg-gray-50'
                } rounded-lg border transition-all duration-200`}
              whileHover={{ y: -1 }}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-400 to-purple-500">
                  <AvatarFallback>{getInitials(device.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{device.username}</h3>
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{device.id.substring(0, 8)}...</p>
                    </div>
                    <div className="hidden xs:flex text-gray-300 mx-1">•</div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
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
                  className="flex items-center gap-1 h-8 px-2.5"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="text-xs">Chat</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
