import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex h-full flex-col justify-between gap-8"
    >
      <div>
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-primary">
          <ShieldCheck className="h-4 w-4" />
          Safety screening active
        </div>
        <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.06] text-foreground md:text-6xl">
          Files move better through <span className="text-primary">SynkNode.</span>
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
          Send, inspect, and receive files through one focused workspace. No sender account required.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Receiver</span>
        <span className="font-display text-xl font-bold text-primary">SRGEC</span>
        <ArrowRight className="h-4 w-4 text-primary" />
      </div>
    </motion.div>
  );
};
