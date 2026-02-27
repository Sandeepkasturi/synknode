import React from 'react';
import { Github, Globe, Mail } from 'lucide-react';
import logo from '@/assets/logo.png';

export const Footer: React.FC = () => {
  const links = [
    { icon: Globe, href: 'https://skavtechs.vercel.app', label: 'SKAV TECH' },
    { icon: Github, href: 'https://github.com/sandeepkasturi', label: 'GitHub' },
    { icon: Mail, href: 'mailto:skavtech.in@gmail.com', label: 'Contact' },
  ];

  return (
    <footer className="border-t border-border/40 mt-16" id="about">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded overflow-hidden">
              <img src={logo} alt="SynkNode" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-sm text-foreground">SynkNode</span>
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Secure file sharing — built by{' '}
            <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Sandeep Kasturi
            </a>
          </p>

          <div className="flex items-center gap-1">
            {links.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label={label}
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground/50">
            © {new Date().getFullYear()} SynkNode
          </p>
        </div>
      </div>
    </footer>
  );
};
