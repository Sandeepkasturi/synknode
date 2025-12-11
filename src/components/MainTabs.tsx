import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download } from "lucide-react";
import { SenderForm } from "./sender/SenderForm";
import { ReceiverPanel } from "./receiver/ReceiverPanel";
import { motion } from "framer-motion";

export const MainTabs: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger 
            value="send" 
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
          >
            <Upload className="h-4 w-4" />
            Send Files
          </TabsTrigger>
          <TabsTrigger 
            value="receive" 
            className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
          >
            <Download className="h-4 w-4" />
            Receive Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SenderForm />
          </motion.div>
        </TabsContent>

        <TabsContent value="receive" className="mt-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReceiverPanel />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
