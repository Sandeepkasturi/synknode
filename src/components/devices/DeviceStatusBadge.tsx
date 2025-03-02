
import React from 'react';
import { usePeer } from '@/context/PeerContext';

export const DeviceStatusBadge: React.FC = () => {
  const { username } = usePeer();

  return (
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
  );
};
