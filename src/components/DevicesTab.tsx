
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { usePeer } from '@/context/PeerContext';
import { useFileTransfer } from '@/context/FileTransferContext';
import { Laptop, User, Share2, RefreshCw, Users, Shield, Send, X, MessageSquare, FileUp, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from '@/context/PeerContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const DevicesTab: React.FC = () => {
  const { onlineDevices, username, peerId, announcePresence, sendChatMessage, chatMessages, isChatOpen, setIsChatOpen, activeChatPeer, setActiveChatPeer } = usePeer();
  const { handlePeerConnect, currentFiles, handleFileSelect } = useFileTransfer();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleConnect = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setActiveChatPeer(deviceId);
    setIsChatOpen(true);
    toast.info(`Opening chat with ${onlineDevices.find(d => d.id === deviceId)?.username || deviceId}...`);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveChatPeer(null);
  };

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

  const refreshDevices = () => {
    setIsRefreshing(true);
    announcePresence();
    toast.info("Scanning for devices...");
    
    // Reset refreshing state after animation completes
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Animation variants for list items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const activeChat = activeChatPeer ? onlineDevices.find(d => d.id === activeChatPeer) : null;
  const currentMessages = activeChatPeer ? chatMessages[activeChatPeer] || [] : [];

  return (
    <AnimatePresence mode="wait">
      {!isChatOpen ? (
        <motion.div 
          key="devices-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6 animate-fade-up"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium text-gray-900">Available Devices</h2>
            <p className="text-sm text-gray-500 mt-1">
              Connect to another device to chat and share files
            </p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <span className="font-medium text-sm">
                {onlineDevices.length} {onlineDevices.length === 1 ? 'device' : 'devices'} found
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshDevices}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {onlineDevices.length === 0 ? (
            <div className="text-center py-10 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg border border-dashed border-gray-300">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Laptop className="mx-auto h-12 w-12 text-indigo-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Waiting for other devices to come online
                </p>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={refreshDevices}
                  className="mt-4"
                >
                  Scan for devices
                </Button>
              </motion.div>
            </div>
          ) : (
            <motion.div 
              className="grid gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {onlineDevices.map((device) => (
                <motion.div 
                  key={device.id}
                  variants={itemVariants}
                  className={`flex items-center justify-between p-4 
                    ${selectedDevice === device.id 
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md' 
                      : 'bg-white hover:bg-gray-50'
                    } rounded-lg border transition-all duration-200 hover:shadow-sm`}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-400 to-purple-500">
                      <AvatarFallback>{getInitials(device.username)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{device.username}</h3>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500">ID: {device.id}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleConnect(device.id)}
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handlePeerConnect(device.id)}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* Online status */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 shadow-sm">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-700">
                Online as <span className="font-medium text-indigo-800">{username || 'Anonymous'}</span>
              </span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="chat-interface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full flex flex-col"
        >
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
                onClick={handleCloseChat}
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
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.senderId === peerId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm
                        ${msg.senderId === peerId 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }
                      `}
                    >
                      {msg.type === 'text' && (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      
                      {msg.type === 'file' && (
                        <div className="flex flex-col">
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      )}
                      
                      {msg.type === 'token' && (
                        <div className="flex flex-col">
                          <p className="text-sm mb-1">Shared token:</p>
                          <div className="flex items-center p-1.5 rounded bg-opacity-20 bg-gray-200 text-xs font-mono">
                            <span 
                              className={msg.senderId === peerId ? 'text-white' : 'text-indigo-700'}
                            >
                              {msg.content}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-1 p-1 h-6 w-6" 
                              onClick={() => copyTokenToClipboard(msg.content)}
                            >
                              <Copy className="h-3 w-3 text-gray-300" />
                            </Button>
                          </div>
                          <button 
                            className={`text-xs mt-1 underline
                              ${msg.senderId === peerId ? 'text-indigo-200' : 'text-indigo-500'}
                            `}
                            onClick={() => handlePeerConnect(msg.content)}
                          >
                            Connect using this token
                          </button>
                        </div>
                      )}
                      
                      <span 
                        className={`text-xs ${msg.senderId === peerId ? 'text-indigo-200' : 'text-gray-500'} block mt-1`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
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
        </motion.div>
      )}
      
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
    </AnimatePresence>
  );
};
