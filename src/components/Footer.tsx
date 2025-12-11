import React from 'react';
import { Github, Globe, Mail, Heart, Shield, Zap, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

export const Footer: React.FC = () => {
  const features = [
    { icon: Zap, text: 'Lightning Fast' },
    { icon: Shield, text: 'End-to-End Encrypted' },
    { icon: Lock, text: 'Complete Privacy' },
  ];

  const socialLinks = [
    { icon: Globe, href: 'https://skavtechs.vercel.app', label: 'SKAV TECH' },
    { icon: Github, href: 'https://github.com/sandeepkasturi', label: 'GitHub' },
    { icon: Mail, href: 'mailto:skavtech.in@gmail.com', label: 'Contact' },
  ];

  return (
    <footer className="mt-16 pt-8 border-t border-border/50" id="about">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div 
            className="text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30">
                <img src={logo} alt="SynkNode" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                SynkNode
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A modern peer-to-peer file sharing platform designed for privacy and speed.
            </p>
          </motion.div>
          
          {/* Features Section */}
          <motion.div 
            className="text-center" 
            id="features"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-4 text-foreground">Features</h3>
            <ul className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Developer Section */}
          <motion.div 
            className="text-center md:text-right"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-4 text-foreground">Developer</h3>
            <p className="font-medium text-foreground mb-4">Sandeep Kasturi</p>
            <div className="flex flex-col space-y-2 items-center md:items-end">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ x: -5 }}
                >
                  <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{label}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="py-6 border-t border-border/50 mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by SKAV TECH
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            © {new Date().getFullYear()} SynkNode. All rights reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
};
