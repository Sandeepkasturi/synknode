
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { usePeer } from '@/context/PeerContext';
import type { ChatMessage } from '@/types/peer.types';
import { useFileTransfer } from '@/context/FileTransferContext';
import { Send, Share2, FileUp, Copy, MessageSquare, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const BroadcastChat: React.FC = () => {
  const { 
    peerId,
    username,
    chatMessages,
    onlineDevices,
    broadcastMessage,
    scanForDevices,
    isScanning
  } = usePeer();
  
  const { currentFiles, handlePeerConnect } = useFileTransfer();
  const [newMessage, setNewMessage] = useState('');
  const [showFileShare, setShowFileShare] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    broadcastMessage(newMessage);
    setNewMessage('');
  };

  const handleShareToken = () => {
    if (!peerId) return;
    
    broadcastMessage(peerId, 'token');
    toast.success("Token shared with everyone");
  };

  const handleShareFiles = () => {
    setShowFileShare(true);
  };

  const confirmFileShare = () => {
    if (currentFiles.length === 0) return;
    
    const fileNames = currentFiles.map(f => f.name).join(', ');
    
    // Create file data for sharing
    const fileDataToShare = currentFiles.map(f => ({ 
      name: f.name, 
      size: f.size, 
      type: f.type 
    }));
    
    broadcastMessage(
      `I'm sharing files with everyone: ${fileNames}`, 
      'file',
      { 
        name: fileNames,
        size: currentFiles.reduce((total, f) => total + f.size, 0),
        type: currentFiles.length > 1 ? 'multiple' : currentFiles[0].type,
        files: fileDataToShare
      }
    );
    
    setShowFileShare(false);
    toast.success("File information shared with everyone");
  };

  const copyTokenToClipboard = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success("Token copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy token");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const messages = chatMessages['broadcast'] || [];
  const onlineCount = onlineDevices.length;

  return (
    <div className="flex flex-col h-full bg-white/50 rounded-xl shadow-sm border border-white/60">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-full">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Global Chat</h3>
            <p className="text-xs text-gray-500">{onlineCount} {onlineCount === 1 ? 'user' : 'users'} online</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareToken}
            className="flex items-center gap-1 text-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share Token</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareFiles}
            className="flex items-center gap-1 text-xs"
            disabled={currentFiles.length === 0}
          >
            <FileUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share Files</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scanForDevices}
            className="flex items-center gap-2 h-8 px-3"
            disabled={isScanning}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScanning ? 'Scanning...' : 'Scan'}</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <MessageSquare className="mx-auto h-12 w-12 text-indigo-200" />
                <p className="mt-2 text-sm text-gray-500">No messages yet</p>
                <p className="text-xs text-gray-400">Be the first to send a message to everyone</p>
              </motion.div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                isCurrentUser={msg.senderId === peerId}
                onCopyToken={copyTokenToClipboard}
                onConnectWithToken={handlePeerConnect}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white">
        <div className="flex items-end gap-2">
          <Textarea
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-10 w-10 p-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={showFileShare} onOpenChange={setShowFileShare}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Files With Everyone</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {currentFiles.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-lg">
                <p className="text-sm text-gray-500">No files selected</p>
                <p className="text-xs text-gray-400 mt-1">Please select files to share</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Selected files:</p>
                {currentFiles.map((file, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded flex justify-between items-center">
                    <span>{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFileShare(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmFileShare}
              disabled={currentFiles.length === 0}
            >
              Share With Everyone
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ChatMessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  onCopyToken: (token: string) => void;
  onConnectWithToken: (token: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isCurrentUser,
  onCopyToken,
  onConnectWithToken
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm
          ${isCurrentUser 
            ? 'bg-indigo-600 text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }
        `}
      >
        {!isCurrentUser && (
          <div className="text-xs font-medium mb-1 text-indigo-600">{message.senderName}</div>
        )}
        
        {message.type === 'text' && (
          <p className="text-sm">{message.content}</p>
        )}
        
        {message.type === 'file' && (
          <div className="flex flex-col">
            <p className="text-sm mb-1">{message.content}</p>
            {message.fileData && (
              <div className="bg-white/60 rounded p-2 mt-1 text-xs">
                <div className="font-medium">Shared Files:</div>
                <div className="text-gray-600 mt-1">
                  {message.fileData.name}
                  {message.fileData.size && (
                    <span className="ml-2 text-gray-500">
                      ({(message.fileData.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {message.type === 'token' && (
          <div className="flex flex-col">
            <p className="text-sm mb-1">Shared token:</p>
            <div className="flex items-center p-1.5 rounded bg-opacity-20 bg-gray-200 text-xs font-mono">
              <span 
                className={isCurrentUser ? 'text-white' : 'text-indigo-700'}
              >
                {message.content}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-1 p-1 h-6 w-6" 
                onClick={() => onCopyToken(message.content)}
              >
                <Copy className="h-3 w-3 text-gray-300" />
              </Button>
            </div>
            <button 
              className={`text-xs mt-1 underline
                ${isCurrentUser ? 'text-indigo-200' : 'text-indigo-500'}
              `}
              onClick={() => onConnectWithToken(message.content)}
            >
              Connect using this token
            </button>
          </div>
        )}
        
        <span 
          className={`text-xs ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'} block mt-1`}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
};
