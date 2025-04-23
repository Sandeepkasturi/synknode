
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Smartphone, Wifi, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center py-12 px-4">
      <motion.h1 
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        SynkNode
      </motion.h1>
      
      <motion.p 
        className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Transfer files securely between devices without uploading to the cloud.
        Your data stays with you, not on servers.
      </motion.p>
      
      <motion.div 
        className="mt-8 space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Wifi className="mr-2 h-4 w-4" /> 
          Share Now
        </Button>
        
        <Link to="/airshare">
          <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
            Try AirShare <ArrowRight className="ml-2 h-4 w-4" /> 
          </Button>
        </Link>
      </motion.div>
      
      <motion.div 
        className="mt-12 flex justify-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="mt-2 font-medium">End-to-End Encrypted</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="mt-2 font-medium">Device to Device</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="mt-2 font-medium">Lightning Fast</p>
        </div>
      </motion.div>
    </div>
  );
};
