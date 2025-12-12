import React from 'react';
import { motion } from 'framer-motion';
import { OrbitalAnimation } from './OrbitalAnimation';

export const HeroSection: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center mb-8 relative pt-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="mb-6"
      >
        <OrbitalAnimation size="lg" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="space-y-4"
      >
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight font-display">
          <span className="bg-gradient-to-r from-white via-primary to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            Share Files
          </span>
          <br />
          <span className="text-2xl md:text-3xl font-light text-muted-foreground mt-2 block ">
            Across the Universe
          </span>
        </h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono font-bold">
            SRGEC
          </span>
          <span>•</span>
          <span>Instant P2P Transfer</span>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-sm text-muted-foreground max-w-md mt-4"
      >
        Secure, private, and lightning-fast file sharing. No accounts, no limits, complete privacy.
      </motion.p>
    </div>
  );
};
