
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileImage, Share, Presentation } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center mb-16 relative">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 relative">
          Share files and present content{' '}
          <span className="relative inline-block">
            <span className="text-primary relative z-10">effortlessly</span>
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
        className="text-xl text-muted-foreground mb-10 max-w-2xl"
      >
        Connect devices instantly and transfer files with complete privacy and speed.
        No accounts, no limits, no tracking.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <Link to="/airshare">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button size="lg" className="text-lg px-8 py-6 flex gap-2 items-center shadow-lg hover:shadow-xl transition-shadow">
              <FileImage className="h-5 w-5" />
              AirShare Files
            </Button>
          </motion.div>
        </Link>
        
        <Link to="/sharomatic">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 flex gap-2 items-center shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm">
              <Presentation className="h-5 w-5" />
              Sharomatic Presenter
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
};
