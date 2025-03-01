
import React from 'react';
import { Upload, Shield, Share2, Zap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center mb-16 space-y-6 animate-fade-in">
      <div className="relative mx-auto mb-6">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-purple/30 via-transparent to-brand-pink/30 blur-3xl rounded-full opacity-70 dark:from-brand-purple/10 dark:to-brand-pink/10" />
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 rainbow-text">
            SynkNode
          </h1>
          <span className="text-lg text-brand-purple/90 dark:text-brand-purple/70 font-medium flex items-center justify-center gap-1.5">
            <Zap size={18} className="text-brand-amber" /> 
            Secure P2P File Transfer
          </span>
        </div>
      </div>
      
      <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
        Share files securely with peers across any network with zero configuration.
      </p>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="glass-card rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-brand-purple/20">
          <div className="bg-gradient-to-br from-brand-purple to-brand-indigo rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Easy Sharing</h3>
          <p className="text-gray-600 dark:text-gray-300">Multiple file uploads with drag & drop simplicity</p>
        </div>
        
        <div className="glass-card rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-brand-teal/20">
          <div className="bg-gradient-to-br from-brand-blue to-brand-teal rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Secure Transfer</h3>
          <p className="text-gray-600 dark:text-gray-300">End-to-end encryption with permission controls</p>
        </div>
        
        <div className="glass-card rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-brand-orange/20">
          <div className="bg-gradient-to-br from-brand-amber to-brand-orange rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Cross-Network</h3>
          <p className="text-gray-600 dark:text-gray-300">Works across different networks and devices</p>
        </div>
      </div>
    </div>
  );
};
