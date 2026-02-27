import React from 'react';
import { Github, Globe, Mail, Zap, Shield, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

export const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Globe, href: 'https://skavtechs.vercel.app', label: 'SKAV TECH' },
    { icon: Github, href: 'https://github.com/sandeepkasturi', label: 'GitHub' },
    { icon: Mail, href: 'mailto:skavtech.in@gmail.com', label: 'Contact' },
  ];

  const features = [
    { icon: Zap, text: 'Lightning Fast' },
    { icon: Shield, text: 'End-to-End Secure' },
    { icon: Cloud, text: '50MB per file' },
  ];

  return (
    <footer className="relative mt-16 border-t border-border/30 overflow-hidden" id="about">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-background/80 to-background pointer-events-none" />
      
      <div className="relative container max-w-6xl mx-auto px-4 py-12">
        {/* Top section - Brand */}
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            className="flex items-center gap-3 mb-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/30 shadow-lg shadow-primary/20">
              <img src={logo} alt="SynkNode" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display tracking-tight text-foreground">SynkNode</h3>
              <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-medium">Secure Transfer Protocol</p>
            </div>
          </motion.div>

          <p className="text-sm text-muted-foreground max-w-sm text-center leading-relaxed">
            Share files across the world — secure, private, and lightning-fast peer-to-peer file sharing.
          </p>
        </div>

        {/* Features pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {features.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/40 text-sm text-muted-foreground"
            >
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            Designed by{' '}
            <a 
              href="https://skavtechs.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Sandeep Kasturi
            </a>
          </p>

          <div className="flex items-center gap-2">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} SynkNode. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
