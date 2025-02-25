
import { useState, useEffect } from "react";
import { FileUpload } from "../components/FileUpload";
import { TokenDisplay } from "../components/TokenDisplay";
import { TokenInput } from "../components/TokenInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Shield, Share2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Secure File Sharing Made Simple
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload files and share them securely with a unique token. Perfect for sharing across devices and with others.
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition-transform">
              <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Upload</h3>
              <p className="text-gray-600">Drag and drop your files or click to upload</p>
            </div>
            <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition-transform">
              <Shield className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Sharing</h3>
              <p className="text-gray-600">Protected with unique access tokens</p>
            </div>
            <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition-transform">
              <Share2 className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-Device</h3>
              <p className="text-gray-600">Access your files from any device</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="upload" className="w-full animate-fade-up">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="download" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-0">
              <div className="space-y-8">
                <FileUpload onFileSelect={handleFileSelect} />
                {token && <TokenDisplay token={token} />}
              </div>
            </TabsContent>

            <TabsContent value="download" className="mt-0">
              <TokenInput onSubmit={handleTokenSubmit} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center text-gray-500 text-sm">
          <p>Secure file sharing application. Share responsibly.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
