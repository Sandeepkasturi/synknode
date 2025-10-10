
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { usePeer } from '@/context/PeerContext';
import { useFileTransfer } from '@/context/FileTransferContext';
import { Laptop, Smartphone, Tablet, Share2, RefreshCw, Users, Wifi, MessageSquare, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
  isAutoScanning: boolean;
}

export const DevicesList: React.FC<DevicesListProps> = ({ 
  handleConnect, 
  isRefreshing, 
  refreshDevices,
  isAutoScanning 
}) => {
  const { onlineDevices } = usePeer();
  const { handlePeerConnect } = useFileTransfer();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getDeviceIcon = (deviceId: string) => {
    // Simulate device type based on ID (in real app, this would come from device info)
    const hash = deviceId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const types = [Laptop, Smartphone, Tablet];
    const Icon = types[hash % types.length];
    return Icon;
  };

  const getSignalStrength = (deviceId: string) => {
    // Simulate signal strength (in real app, this would be actual connection quality)
    const hash = deviceId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return Math.max(50, hash % 100);
  };

  return (
    <>
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center mb-6 p-4 rounded-lg bg-card border border-border"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={isAutoScanning ? {
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Radio className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {onlineDevices.length} {onlineDevices.length === 1 ? 'Device' : 'Devices'}
              </span>
              {isAutoScanning && (
                <Badge variant="secondary" className="text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  Scanning
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              P2P Network Discovery Active
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshDevices}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Scan
        </Button>
      </motion.div>

      {onlineDevices.length === 0 ? (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Wifi className="mx-auto h-16 w-16 text-primary/40" />
          </motion.div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">Searching for devices...</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            Make sure other devices are on the same network and have the app open
          </p>
          <Button 
            variant="default"
            size="sm" 
            onClick={refreshDevices}
            className="mt-6"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Scan Again
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {onlineDevices.map((device, index) => {
            const DeviceIcon = getDeviceIcon(device.id);
            const signalStrength = getSignalStrength(device.id);
            
            return (
              <motion.div 
                key={device.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01, x: 4 }}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300
                  ${selectedDevice === device.id 
                    ? 'bg-primary/5 border-primary shadow-lg shadow-primary/20' 
                    : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
                  }`}
              >
                {/* Signal strength indicator */}
                <div className="absolute top-0 right-0 p-3">
                  <div className="flex items-center gap-1">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 4 }}
                        animate={{ 
                          height: i * 25 < signalStrength ? 4 + i * 3 : 4,
                          opacity: i * 25 < signalStrength ? 1 : 0.3
                        }}
                        className={`w-1 rounded-full ${
                          i * 25 < signalStrength ? 'bg-primary' : 'bg-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Device icon with animation */}
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <DeviceIcon className="h-6 w-6 text-primary" />
                        </div>
                        <motion.div
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-primary/20"
                        />
                      </motion.div>

                      {/* Device info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground truncate">
                          {device.username}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Wifi className="h-3 w-3 mr-1" />
                            P2P
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">
                            {device.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 ml-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDevice(device.id);
                            handleConnect(device.id);
                          }}
                          className="flex items-center gap-1"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="hidden sm:inline">Chat</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm"
                          onClick={() => handlePeerConnect(device.id)}
                          className="flex items-center gap-1"
                        >
                          <Share2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Share</span>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </>
  );
};
