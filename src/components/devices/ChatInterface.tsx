
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { usePeer } from '@/context/PeerContext';
import type { ChatMessage } from '@/types/peer.types'; // Changed to type-only import
import { useFileTransfer } from '@/context/FileTransferContext';
import { X, Send, Share2, FileUp, Copy, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ChatInterfaceProps {
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const { 
    peerId,
    activeChatPeer,
    chatMessages,
    onlineDevices,
    sendChatMessage
  } = usePeer();
  
  const { currentFiles, handlePeerConnect } = useFileTransfer();
  const [newMessage, setNewMessage] = useState('');
  const [showFileShare, setShowFileShare] = useState(false);
  const [shareFilesFor, setShareFilesFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    if (messagesEndRef.current && activeChatPeer) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatPeer]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChatPeer) return;
    
    sendChatMessage(activeChatPeer, newMessage);
    setNewMessage('');
  };

  const handleShareToken = () => {
    if (!activeChatPeer || !peerId) return;
    
    // Send current peer ID as a token message
    sendChatMessage(activeChatPeer, peerId, 'token');
    toast.success("Token shared successfully");
  };

  const handleShareFiles = () => {
    setShowFileShare(true);
    setShareFilesFor(activeChatPeer);
  };

  const confirmFileShare = () => {
    if (!shareFilesFor || currentFiles.length === 0) return;
    
    // Connect to peer for file transfer
    handlePeerConnect(shareFilesFor);
    
    // Also send a message about the files
    const fileNames = currentFiles.map(f => f.name).join(', ');
    sendChatMessage(
      shareFilesFor, 
      `I'm sending you files: ${fileNames}`, 
      'file',
      { files: currentFiles.map(f => ({ name: f.name, size: f.size, type: f.type })) }
    );
    
    setShowFileShare(false);
    toast.success("File transfer initiated");
  };

  const copyTokenToClipboard = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success("Token copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy token");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const activeChat = activeChatPeer ? onlineDevices.find(d => d.id === activeChatPeer) : null;
  const currentMessages = activeChatPeer ? chatMessages[activeChatPeer] || [] : [];

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 bg-gradient-to-br from-indigo-400 to-purple-500">
            <AvatarFallback>{activeChat ? getInitials(activeChat.username) : '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{activeChat?.username || 'User'}</h3>
            <p className="text-xs text-gray-500">ID: {activeChatPeer}</p>
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
            Share Token
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareFiles}
            className="flex items-center gap-1 text-xs"
            disabled={currentFiles.length === 0}
          >
            <FileUp className="h-3.5 w-3.5" />
            Share Files
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {currentMessages.length === 0 ? (
            <div className="text-center py-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <MessageSquare className="mx-auto h-12 w-12 text-indigo-200" />
                <p className="mt-2 text-sm text-gray-500">No messages yet</p>
                <p className="text-xs text-gray-400">Start the conversation by sending a message</p>
              </motion.div>
            </div>
          ) : (
            currentMessages.map((msg) => (
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

      {/* Message input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-end gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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

      {/* File sharing dialog */}
      <Dialog open={showFileShare} onOpenChange={setShowFileShare}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Files</DialogTitle>
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
              Share Files
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
        {message.type === 'text' && (
          <p className="text-sm">{message.content}</p>
        )}
        
        {message.type === 'file' && (
          <div className="flex flex-col">
            <p className="text-sm">{message.content}</p>
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
