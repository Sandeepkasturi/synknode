import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Download } from 'lucide-react';
import { SenderForm } from './sender/SenderForm';
import { ReceiverPanel } from './receiver/ReceiverPanel';

export const MainTabs: React.FC = () => {
  const [direction, setDirection] = useState('send');
  return <Tabs value={direction} onValueChange={setDirection} className="w-full">
    <div className="workspace-heading"><h1>{direction === 'send' ? <>Transfer smarter.<br className="hidden sm:block" /> <span className="text-primary">Share better.</span></> : 'Your transfer room'}</h1><p>{direction === 'send' ? 'A simple, secure way to send files to SRGEC.' : 'Receive files from your senders, all in one place.'}</p></div>
    <TabsList className="direction-tabs"><TabsTrigger value="send"><Send className="h-4 w-4" />Send</TabsTrigger><TabsTrigger value="receive"><Download className="h-4 w-4" />Receive</TabsTrigger></TabsList>
    <TabsContent value="send" forceMount className="mt-0 data-[state=inactive]:hidden"><SenderForm /></TabsContent>
    <TabsContent value="receive" className="mt-0"><ReceiverPanel /></TabsContent>
  </Tabs>;
};
