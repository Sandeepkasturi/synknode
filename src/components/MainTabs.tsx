import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download } from "lucide-react";
import { SenderForm } from "./sender/SenderForm";
import { ReceiverPanel } from "./receiver/ReceiverPanel";

export const MainTabs: React.FC = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="send" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid w-full max-w-xs grid-cols-2 p-1 bg-secondary/60 rounded-lg">
            <TabsTrigger
              value="send"
              className="flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Upload className="h-4 w-4" />
              Send
            </TabsTrigger>
            <TabsTrigger
              value="receive"
              className="flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Download className="h-4 w-4" />
              Receive
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="send" className="mt-0 focus-visible:outline-none">
          <SenderForm />
        </TabsContent>

        <TabsContent value="receive" className="mt-0 focus-visible:outline-none">
          <ReceiverPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
