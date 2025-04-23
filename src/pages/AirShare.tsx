
import React from 'react';
import { AirShareProvider } from '../context/AirShareContext';
import { ConnectionCode } from '../components/airshare/ConnectionCode';
import { FileDropZone } from '../components/airshare/FileDropZone';
import { FilePreview } from '../components/airshare/FilePreview';
import { useAirShare } from '../context/AirShareContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Inner content component that uses the context
const AirShareContent: React.FC = () => {
  const { isConnected } = useAirShare();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 pt-12 pb-24">
        <div className="mb-8 flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AirShare</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Easily share and preview files between devices in real time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <ConnectionCode />
        </motion.div>

        {isConnected && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FileDropZone />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-semibold mb-4 text-center">File Preview</h2>
              <FilePreview />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

// Wrapper component with provider
const AirShare: React.FC = () => (
  <AirShareProvider>
    <AirShareContent />
  </AirShareProvider>
);

export default AirShare;
