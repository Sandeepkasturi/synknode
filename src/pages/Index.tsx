
import { useState, useEffect } from "react";
import { FileUpload } from "../components/FileUpload";
import { TokenDisplay } from "../components/TokenDisplay";
import { TokenInput } from "../components/TokenInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";

// Generate a random token of length between 4 and 6 characters
const generateToken = () => {
  const length = Math.floor(Math.random() * 3) + 4; // Random length between 4 and 6
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

interface FileData {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

const Index = () => {
  const [token, setToken] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // Store file data when uploading
  const handleFileSelect = (file: File) => {
    const newToken = generateToken();
    setToken(newToken);
    setCurrentFile(file);
    
    // Store file metadata in localStorage
    const fileData: FileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    };
    localStorage.setItem(newToken, JSON.stringify(fileData));
  };

  // Handle token verification and file download
  const handleTokenSubmit = (submittedToken: string) => {
    const fileData = localStorage.getItem(submittedToken);
    
    if (!fileData) {
      toast.error("Invalid token. Please check and try again.");
      return;
    }

    const parsedFileData: FileData = JSON.parse(fileData);
    
    // Create and trigger download
    if (currentFile) {
      const url = URL.createObjectURL(currentFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = parsedFileData.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("File download started!");
    } else {
      toast.info(`File "${parsedFileData.name}" is ready for download`);
    }
  };

  // Cleanup localStorage when component unmounts
  useEffect(() => {
    return () => {
      if (token) {
        localStorage.removeItem(token);
      }
    };
  }, [token]);

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
