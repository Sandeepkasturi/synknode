
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, MessageSquare } from "lucide-react";
import { useFileTransfer } from '../context/FileTransferContext';
import { usePeer } from '../context/PeerContext';
import { FileUpload } from "./FileUpload";
import { TokenDisplay } from "./TokenDisplay";
import { TokenInput } from "./TokenInput";
import { TransferStatus } from "./TransferStatus";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export const FileTransferTabs: React.FC = () => {
  const { handleFileSelect, currentFiles, handlePeerConnect, transferStatus } = useFileTransfer();
  const { peerId, username } = usePeer();
  const navigate = useNavigate();

  if (!username) {
    return null; // Don't render if no username yet
  }

  const handleOpenChat = () => {
    navigate('/chat');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/50 backdrop-blur-md rounded-xl p-6 shadow-md border border-white/60">
      <Tabs defaultValue="chat" className="w-full animate-fade-up">
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
            Chat
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
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>

            <h3 className="text-2xl font-semibold text-center">Global Chat</h3>
            
            <p className="text-center text-gray-600 max-w-md">
              Connect with everyone in the global chat room. Share messages, files, and more in real-time.
            </p>

            <Button 
              size="lg" 
              onClick={handleOpenChat}
              className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Open Chat Room
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
