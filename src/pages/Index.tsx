
import React from "react";
import { PeerProvider } from "../context/PeerContext";
import { FileTransferProvider } from "../context/FileTransferContext";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { HeroSection } from "../components/HeroSection";
import { FileTransferTabs } from "../components/FileTransferTabs";
import { InfoSection } from "../components/InfoSection";
import { Footer } from "../components/Footer";
import { PermissionDialog } from "@/components/PermissionDialog";
import { UsernameDialog } from "@/components/UsernameDialog";
import { useFileTransfer } from "../context/FileTransferContext";
import { motion } from "framer-motion";

// Main content component
const IndexContent: React.FC = () => {
  const { showPermissionDialog, pendingPermission, handlePermissionResponse } = useFileTransfer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container max-w-6xl mx-auto px-4 py-16"
      >
        <ConnectionStatus />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <HeroSection />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <FileTransferTabs />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <InfoSection />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Footer />
        </motion.div>
      </motion.div>
      
      {/* Dialogs */}
      <UsernameDialog />
      
      {showPermissionDialog && (
        <PermissionDialog 
          requesterPeerId={pendingPermission.conn?.peer || ''}
          files={pendingPermission.files}
          onConfirm={() => handlePermissionResponse(true)}
          onCancel={() => handlePermissionResponse(false)}
        />
      )}
    </div>
  );
};

// Wrapper with providers
const Index: React.FC = () => {
  return (
    <PeerProvider>
      <FileTransferProvider>
        <IndexContent />
      </FileTransferProvider>
    </PeerProvider>
  );
};

export default Index;
