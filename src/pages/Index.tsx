
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="container max-w-6xl mx-auto px-4 py-16 relative z-10"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <ConnectionStatus />
        </motion.div>
        
        
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, type: "spring", stiffness: 100 }}
        >
          <HeroSection />
        </motion.div>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          whileHover={{ scale: 1.01 }}
          className="backdrop-blur-sm bg-card/50 rounded-2xl shadow-2xl border border-border/50 p-8 my-8"
        >
          <FileTransferTabs />
        </motion.div>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.7 }}
        >
          <InfoSection />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
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
