
import React from 'react';
import { Shield, Share2, Zap, Wifi, Globe, Lock } from 'lucide-react';

export const InfoSection: React.FC = () => {
  return (
    <div className="mt-24 space-y-10">
      <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
        Why Choose SynkNode?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-border bg-card">
          <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            Security Features
          </h3>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <span className="font-medium block text-card-foreground">End-to-End Encryption</span>
                <span className="text-sm">Your files never pass through external servers</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <span className="font-medium block text-card-foreground">Permission Control</span>
                <span className="text-sm">Explicit permission required for each transfer</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Wifi className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <span className="font-medium block text-card-foreground">Direct Connection</span>
                <span className="text-sm">Peer-to-peer transfer for enhanced privacy</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-border bg-card">
          <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            Advantages
          </h3>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <span className="font-medium block text-card-foreground">Cross-Network Sharing</span>
                <span className="text-sm">Works across different networks and internet connections</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Share2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <span className="font-medium block text-card-foreground">No Size Limits</span>
                <span className="text-sm">Transfer files of any size without restrictions</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <span className="font-medium block text-card-foreground">Blazing Fast</span>
                <span className="text-sm">Direct connection provides maximum transfer speeds</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto mt-16 bg-card rounded-xl p-6 border border-border">
        <h3 className="text-xl font-bold text-center text-card-foreground mb-4">How Cross-Network Sharing Works</h3>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-primary">1</span>
            </div>
            <div>
              <p className="text-muted-foreground">
                Files are shared through a cloud signaling server that helps establish the connection between peers.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-primary">2</span>
            </div>
            <div>
              <p className="text-muted-foreground">
                Once connected, files transfer directly between devices with end-to-end encryption.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-primary">3</span>
            </div>
            <div>
              <p className="text-muted-foreground">
                The process works even between different networks, carriers, and ISPs worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
