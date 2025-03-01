
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Laptop } from "lucide-react";
import { useFileTransfer } from '../context/FileTransferContext';
import { usePeer } from '../context/PeerContext';
import { FileUpload } from "./FileUpload";
import { TokenDisplay } from "./TokenDisplay";
import { TokenInput } from "./TokenInput";
import { TransferStatus } from "./TransferStatus";
import { DevicesTab } from './DevicesTab';

export const FileTransferTabs: React.FC = () => {
  const { handleFileSelect, currentFiles, handlePeerConnect, transferStatus } = useFileTransfer();
  const { peerId } = usePeer();

  return (
    <div className="max-w-3xl mx-auto">
      <Tabs defaultValue="upload" className="w-full animate-fade-up">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Share File
          </TabsTrigger>
          <TabsTrigger value="download" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Receive File
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            Devices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <div className="space-y-8">
            <FileUpload onFileSelect={handleFileSelect} />
            {peerId && currentFiles.length > 0 && <TokenDisplay token={peerId} />}
          </div>
        </TabsContent>

        <TabsContent value="download" className="mt-0">
          <div className="space-y-8">
            <TokenInput onSubmit={handlePeerConnect} />
            {transferStatus.active && (
              <TransferStatus 
                status={transferStatus.status} 
                progress={transferStatus.progress} 
                remotePeer={transferStatus.remotePeer} 
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="mt-0">
          <DevicesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
