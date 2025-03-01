
import React from "react";
import { PeerProvider } from "../context/PeerContext";
import { FileTransferProvider } from "../context/FileTransferContext";
import { ConnectionStatus } from "../components/ConnectionStatus";
import { HeroSection } from "../components/HeroSection";
import { FileTransferTabs } from "../components/FileTransferTabs";
import { InfoSection } from "../components/InfoSection";
import { Footer } from "../components/Footer";
import { PermissionDialog } from "@/components/PermissionDialog";
import { useFileTransfer } from "../context/FileTransferContext";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "../context/ThemeContext";

// Main content component
const IndexContent: React.FC = () => {
  const { showPermissionDialog, pendingPermission, handlePermissionResponse } = useFileTransfer();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950 dark:via-gray-900 dark:to-purple-950 transition-colors duration-300">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <ConnectionStatus />
        <HeroSection />
        <FileTransferTabs />
        <InfoSection />
        <Footer />
      </div>
      
      {/* Permission Dialog */}
      {showPermissionDialog && (
        <PermissionDialog 
          requesterPeerId={pendingPermission.conn?.peer || ''}
          files={pendingPermission.files}
          onConfirm={() => handlePermissionResponse(true)}
          onCancel={() => handlePermissionResponse(false)}
        />
      )}
      
      {/* Single Toaster for notifications */}
      <Toaster position="top-right" richColors closeButton theme={theme} />
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
