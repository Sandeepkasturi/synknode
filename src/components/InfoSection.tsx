
import React from 'react';
import { Shield, Share2, Zap, Wifi, Globe, Lock } from 'lucide-react';

export const InfoSection: React.FC = () => {
  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-brand-indigo to-brand-purple">
        Why Choose SynkNode?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5 shadow-sm hover:shadow-brand-purple/20 transition-all border border-white/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="bg-gradient-to-br from-brand-purple to-brand-blue rounded-full w-7 h-7 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            Security Features
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-brand-purple mt-0.5" />
              <div>
                <span className="font-medium block text-gray-800 text-sm">End-to-End Encryption</span>
                <span className="text-xs">Your files never pass through external servers</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-brand-purple mt-0.5" />
              <div>
                <span className="font-medium block text-gray-800 text-sm">Permission Control</span>
                <span className="text-xs">Explicit permission required for each transfer</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Wifi className="w-4 h-4 text-brand-purple mt-0.5" />
              <div>
                <span className="font-medium block text-gray-800 text-sm">Direct Connection</span>
                <span className="text-xs">Peer-to-peer transfer for enhanced privacy</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="glass-card rounded-xl p-5 shadow-sm hover:shadow-brand-blue/20 transition-all border border-white/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="bg-gradient-to-br from-brand-blue to-brand-teal rounded-full w-7 h-7 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            Advantages
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-brand-blue mt-0.5" />
              <div>
                <span className="font-medium block text-gray-800 text-sm">Cross-Network Sharing</span>
                <span className="text-xs">Works across different networks and connections</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Share2 className="w-4 h-4 text-brand-blue mt-0.5" />
              <div>
                <span className="font-medium block text-gray-800 text-sm">No Size Limits</span>
                <span className="text-xs">Transfer files of any size without restrictions</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-brand-blue mt-0.5" />
              <div>
                <span className="font-medium block text-gray-800 text-sm">Blazing Fast</span>
                <span className="text-xs">Direct connection provides maximum transfer speeds</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto mt-10 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-xl p-5 border border-white/40">
        <h3 className="text-lg font-bold text-center text-gray-900 mb-3">How Cross-Network Sharing Works</h3>
        <div className="flex flex-col space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white/40 rounded-lg">
            <div className="bg-brand-purple/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-brand-purple text-xs">1</span>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Files are shared through a cloud signaling server that helps establish the connection between peers.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white/40 rounded-lg">
            <div className="bg-brand-indigo/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-brand-indigo text-xs">2</span>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Once connected, files transfer directly between devices with end-to-end encryption.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white/40 rounded-lg">
            <div className="bg-brand-blue/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-brand-blue text-xs">3</span>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                The process works even between different networks, carriers, and ISPs worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
