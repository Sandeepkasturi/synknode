
import React from 'react';
import { Upload, Shield, Share2 } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center mb-16 space-y-6 animate-fade-in">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
        Synk Node Network File Sharing
      </h1>
      <br></br>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Share files securely with peers on your local network.
      </p>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition-transform">
          <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Upload</h3>
          <p className="text-gray-600">Drag and drop your files to share</p>
        </div>
        <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition-transform">
          <Shield className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Network</h3>
          <p className="text-gray-600">Direct peer-to-peer sharing</p>
        </div>
        <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition-transform">
          <Share2 className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Transfer</h3>
          <p className="text-gray-600">Direct device-to-device transfer</p>
        </div>
      </div>
    </div>
  );
};
