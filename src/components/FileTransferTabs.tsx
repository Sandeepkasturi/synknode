
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, MessageSquare } from "lucide-react";
import { useFileTransfer } from '../context/FileTransferContext';
import { usePeer } from '../context/PeerContext';
import { FileUpload } from "./FileUpload";
import { TokenDisplay } from "./TokenDisplay";
import { TokenInput } from "./TokenInput";
import { TransferStatus } from "./TransferStatus";
import { BroadcastChat } from './broadcast/BroadcastChat';

export const FileTransferTabs: React.FC = () => {
  const { handleFileSelect, currentFiles, handlePeerConnect, transferStatus } = useFileTransfer();
  const { peerId } = usePeer();

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/50 rounded-xl p-6 shadow-sm border border-white/60">
      <Tabs defaultValue="upload" className="w-full animate-fade-up">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Share File
          </TabsTrigger>
          <TabsTrigger value="download" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Receive File
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Global Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <div className="space-y-6">
            <FileUpload onFileSelect={handleFileSelect} />
            {peerId && currentFiles.length > 0 && <TokenDisplay token={peerId} />}
          </div>
        </TabsContent>

        <TabsContent value="download" className="mt-0">
          <div className="space-y-6">
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

        <TabsContent value="chat" className="mt-0">
          <BroadcastChat />
        </TabsContent>
      </Tabs>
    </div>
  );
};
