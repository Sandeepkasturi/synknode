import React from 'react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center space-y-4 max-w-lg mx-auto"
    >
      <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-tight">
        Share Files,{' '}
        <span className="text-primary">Instantly</span>
      </h2>

      <p className="text-base text-muted-foreground max-w-sm leading-relaxed">
        Secure, private file sharing — no sign-up needed. Just drop, send, and go.
      </p>

      <div className="flex items-center gap-3 pt-2">
        <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide border border-primary/20">
          SRGEC
        </span>
        <span className="text-xs text-muted-foreground">50MB per file · 100 files/day</span>
      </div>
    </motion.div>
  );
};
