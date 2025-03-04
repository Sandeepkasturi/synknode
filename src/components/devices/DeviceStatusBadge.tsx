
import React from 'react';
import { usePeer } from '@/context/PeerContext';

export const DeviceStatusBadge: React.FC = () => {
  const { username } = usePeer();

  return (
    <div className="text-center mb-4 sm:mb-6">
      <div className="inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 shadow-sm border border-white/60">
        <span className="relative flex h-2 w-2 mr-1.5 sm:mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[150px] sm:max-w-none">
          Online as <span className="font-medium text-indigo-800">{username || 'Anonymous'}</span>
        </span>
      </div>
    </div>
  );
};
