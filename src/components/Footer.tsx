import React from 'react';
import { Github, Globe, Mail, Heart } from 'lucide-react';
import { TrustedBadge } from './TrustedBadge';

export const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Globe, href: 'https://skavtechs.vercel.app', label: 'SKAV TECH' },
    { icon: Github, href: 'https://github.com/sandeepkasturi', label: 'GitHub' },
    { icon: Mail, href: 'mailto:skavtech.in@gmail.com', label: 'Contact' },
  ];

  return (
    <footer className="mt-16 border-t border-border/40 bg-background/50 backdrop-blur-sm" id="about">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg font-display tracking-tight text-foreground">SynkNode</span>
              <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">v2.0</span>
            </div>
            <p className="text-sm text-muted-foreground">Secure P2P File Sharing</p>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium text-foreground/80">
              Designed and Developed by <span className="text-primary">Sandeep Kasturi</span>
            </p>
            <div className="flex items-center gap-4 mt-1">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary rounded-full"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-1">
              © {new Date().getFullYear()} SynkNode. All rights reserved.
            </p>
          </div>

          <div className="hidden md:block">
            <TrustedBadge />
          </div>
        </div>
      </div>
    </footer>
  );
};
