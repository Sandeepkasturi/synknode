
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { usePeer } from '@/context/PeerContext';
import { useFileTransfer } from '@/context/FileTransferContext';
import { Laptop, User, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export const DevicesTab: React.FC = () => {
  const { onlineDevices, username, peerId } = usePeer();
  const { handlePeerConnect } = useFileTransfer();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const handleConnect = (deviceId: string) => {
    setSelectedDevice(deviceId);
    handlePeerConnect(deviceId);
    toast.info(`Connecting to ${onlineDevices.find(d => d.id === deviceId)?.username || deviceId}...`);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="text-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">Available Devices</h2>
        <p className="text-sm text-gray-500 mt-1">
          Connect directly to another device to share files
        </p>
      </div>

      {onlineDevices.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Laptop className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Waiting for other devices to come online
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {onlineDevices.map((device) => (
            <div 
              key={device.id}
              className={`flex items-center justify-between p-4 ${
                selectedDevice === device.id 
                  ? 'bg-indigo-50 border-indigo-300' 
                  : 'bg-white hover:bg-gray-50'
              } rounded-lg border transition-colors`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{device.username}</h3>
                  <p className="text-xs text-gray-500">ID: {device.id}</p>
                </div>
              </div>
              <Button 
                size="sm"
                onClick={() => handleConnect(device.id)}
                disabled={selectedDevice === device.id}
                className="flex items-center space-x-1"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Connect
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Online status */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gray-100">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-gray-700">
            Online as <span className="font-medium">{username || 'Anonymous'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
