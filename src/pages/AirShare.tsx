
import React, { useEffect } from 'react';
import { AirShareProvider } from '../context/AirShareContext';
import { ConnectionCode } from '../components/airshare/ConnectionCode';
import { FileDropZone } from '../components/airshare/FileDropZone';
import { FilePreview } from '../components/airshare/FilePreview';
import { P2PConnectionStatus } from '../components/airshare/P2PConnectionStatus';
import { useAirShare } from '../context/AirShareContext';
import { usePeer } from '../context/PeerContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Inner content component that uses the context
const AirShareContent: React.FC = () => {
  const { isConnected: isAirShareConnected } = useAirShare();
  const { isConnected: isPeerConnected, createNewPeer } = usePeer();

  // Ensure P2P connection is established when component mounts
  useEffect(() => {
    if (!isPeerConnected) {
      createNewPeer();
    }
  }, [isPeerConnected, createNewPeer]);

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-4xl font-bold text-foreground mb-3">AirShare</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Easily share and preview files between devices in real time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <P2PConnectionStatus />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <ConnectionCode />
        </motion.div>

        {isAirShareConnected && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FileDropZone />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
