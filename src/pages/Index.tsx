
import { useState } from "react";
import { FileUpload } from "../components/FileUpload";
import { TokenDisplay } from "../components/TokenDisplay";
import { TokenInput } from "../components/TokenInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";

const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const Index = () => {
  const [token, setToken] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    // Here we would normally upload the file to a server
    // For now, we'll just generate a token
    const newToken = generateToken();
    setToken(newToken);
  };

  const handleTokenSubmit = (submittedToken: string) => {
    // Here we would normally verify the token and download the file
    toast.success("Token received! File download would start here.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Secure File Sharing
          </h1>
          <p className="text-lg text-gray-600">
            Upload, share, and access files securely with tokens
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="download" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0 animate-fade-up">
            <div className="space-y-8">
              <FileUpload onFileSelect={handleFileSelect} />
              {token && <TokenDisplay token={token} />}
            </div>
          </TabsContent>

          <TabsContent value="download" className="mt-0 animate-fade-up">
            <TokenInput onSubmit={handleTokenSubmit} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
