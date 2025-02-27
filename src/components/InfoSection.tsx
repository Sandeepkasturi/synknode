
import React from 'react';
import { Shield, Share2 } from 'lucide-react';

export const InfoSection: React.FC = () => {
  return (
    <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Features</h3>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-indigo-500 mt-0.5" />
            <span>Direct peer-to-peer connection for enhanced privacy</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-indigo-500 mt-0.5" />
            <span>Files never pass through external servers</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-indigo-500 mt-0.5" />
            <span>Sender permission required for each transfer</span>
          </li>
        </ul>
      </div>

      <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Advantages</h3>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start gap-2">
            <Share2 className="w-5 h-5 text-indigo-500 mt-0.5" />
            <span>Fast local network transfer speeds</span>
          </li>
          <li className="flex items-start gap-2">
            <Share2 className="w-5 h-5 text-indigo-500 mt-0.5" />
            <span>No file size limitations</span>
          </li>
          <li className="flex items-start gap-2">
            <Share2 className="w-5 h-5 text-indigo-500 mt-0.5" />
            <span>Works without internet connection</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
