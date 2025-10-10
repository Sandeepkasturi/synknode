
import React from 'react';
import { Github, Globe, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 pt-10 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4 text-foreground">SynkNode</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A modern peer-to-peer file sharing application that works across networks with end-to-end encryption.
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-bold mb-4 text-foreground">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Multiple file upload</li>
              <li>Cross-network sharing</li>
              <li>End-to-end encryption</li>
              <li>No file size limits</li>
              <li>No account required</li>
            </ul>
          </div>
          
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-4 text-foreground">Developer</h3>
            <p className="font-medium text-foreground">Sandeep Kasturi</p>
            <div className="flex flex-col space-y-2 mt-4 items-center md:items-end">
              <a 
                href="https://skavtechs.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
              >
                <Globe size={16} />
                SKAV TECH
              </a>
              <a 
                href="https://github.com/sandeepkasturi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
              >
                <Github size={16} />
                GitHub
              </a>
              <a 
                href="mailto:skavtech.in@gmail.com" 
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
              >
                <Mail size={16} />
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-6 border-t border-border mt-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SKAV TECH. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Built with modern web technologies for secure file sharing.
          </p>
        </div>
      </div>
    </footer>
  );
};
