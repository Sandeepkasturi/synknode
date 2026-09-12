import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download } from "lucide-react";
import { SenderForm } from "./sender/SenderForm";
import { ReceiverPanel } from "./receiver/ReceiverPanel";

export const MainTabs: React.FC = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="send" className="w-full">
        <div className="mb-7 flex items-center justify-between gap-4 border-b border-border pb-4">
          <div><h2 className="font-display text-xl font-bold">Transfer console</h2><p className="mt-1 text-xs text-muted-foreground">Choose a direction to begin</p></div>
          <TabsList className="grid w-full max-w-xs grid-cols-2 rounded-md bg-secondary p-1">
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
