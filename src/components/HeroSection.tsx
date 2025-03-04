
import React from 'react';
import { Upload, Shield, Share2, Zap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center space-y-6 animate-fade-in">
      <div className="relative mx-auto mb-6">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-purple/30 via-transparent to-brand-pink/30 blur-3xl rounded-full opacity-70" />
        <div className="relative">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-br from-brand-purple to-brand-indigo">
            SynkNode
          </h1>
          <span className="text-base md:text-lg text-brand-purple/90 font-medium flex items-center justify-center gap-1.5">
            <Zap size={18} className="text-brand-amber" /> 
            Secure P2P File Transfer
          </span>
        </div>
      </div>
      
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
        Share files securely with peers across any network with zero configuration.
      </p>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-10">
        <div className="glass-card rounded-xl p-5 hover:scale-102 transition-all duration-300 shadow-sm hover:shadow-brand-purple/20 border border-white/50">
          <div className="bg-gradient-to-br from-brand-purple to-brand-indigo rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Easy Sharing</h3>
          <p className="text-sm text-gray-600">Multiple file uploads with drag & drop simplicity</p>
        </div>
        
        <div className="glass-card rounded-xl p-5 hover:scale-102 transition-all duration-300 shadow-sm hover:shadow-brand-teal/20 border border-white/50">
          <div className="bg-gradient-to-br from-brand-blue to-brand-teal rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Secure Transfer</h3>
          <p className="text-sm text-gray-600">End-to-end encryption with permission controls</p>
        </div>
        
        <div className="glass-card rounded-xl p-5 hover:scale-102 transition-all duration-300 shadow-sm hover:shadow-brand-orange/20 border border-white/50">
          <div className="bg-gradient-to-br from-brand-amber to-brand-orange rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Cross-Network</h3>
          <p className="text-sm text-gray-600">Works across different networks and devices</p>
        </div>
      </div>
    </div>
  );
};
