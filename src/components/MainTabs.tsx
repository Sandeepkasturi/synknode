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
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/20 backdrop-blur-sm p-1.5 rounded-2xl border border-white/10">
          <TabsTrigger
            value="send"
            className="flex items-center gap-2 rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all duration-300 font-display tracking-wide"
          >
            <Upload className="h-4 w-4" />
            Send Files
          </TabsTrigger>
          <TabsTrigger
            value="receive"
            className="flex items-center gap-2 rounded-xl py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all duration-300 font-display tracking-wide"
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
