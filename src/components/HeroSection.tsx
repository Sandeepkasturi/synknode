import React from 'react';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center mb-12 relative">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="mb-6"
      >
        <div className="p-4 rounded-full bg-primary/10 mb-4 inline-block">
          <Share2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground relative">
          Quick File{' '}
          <span className="relative inline-block">
            <span className="text-primary relative z-10">Transfer</span>
            <motion.span
              className="absolute inset-0 bg-primary/20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </span>
        </h1>
      </motion.div>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-lg text-muted-foreground max-w-xl"
      >
        Send files instantly using the code <span className="font-bold text-primary">SRGEC</span>. 
        No accounts, no limits, complete privacy.
      </motion.p>
    </div>
  );
};
