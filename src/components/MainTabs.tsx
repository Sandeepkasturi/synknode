import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download } from "lucide-react";
import { SenderForm } from "./sender/SenderForm";
import { ReceiverPanel } from "./receiver/ReceiverPanel";

export const MainTabs: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Send Files
          </TabsTrigger>
          <TabsTrigger value="receive" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Receive Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-0">
          <SenderForm />
        </TabsContent>

        <TabsContent value="receive" className="mt-0">
          <ReceiverPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
