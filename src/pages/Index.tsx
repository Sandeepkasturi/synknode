
import { useState, useEffect } from "react";
import { FileUpload } from "../components/FileUpload";
import { TokenDisplay } from "../components/TokenDisplay";
import { TokenInput } from "../components/TokenInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Shield, Share2, Wifi } from "lucide-react";
import { toast } from "sonner";
import Peer from "peerjs";

// Generate a 5-character token
const generatePeerId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
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
  const [peerId, setPeerId] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingConnections, setPendingConnections] = useState<Map<string, any>>(new Map());

  // Initialize PeerJS connection with cloud server
  useEffect(() => {
    const newPeer = new Peer();

    newPeer.on('open', (id) => {
      console.log('Connected to P2P network with ID:', id);
      setIsConnected(true);
      toast.success("Connected to P2P network!");
    });

    newPeer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);
      
      conn.on('data', async (data: { type: string, requestedFile?: string }) => {
        console.log('Received data:', data);
        
        if (data.type === 'request-permission') {
          const isApproved = window.confirm(`User ${conn.peer} wants to download your file. Allow?`);
          
          if (isApproved && currentFile) {
            try {
              // Convert file to ArrayBuffer for transfer
              const buffer = await currentFile.arrayBuffer();
              conn.send({
                type: 'permission-granted',
                fileData: buffer,
                fileName: currentFile.name,
                fileType: currentFile.type,
                fileSize: currentFile.size,
              });
              toast.success(`Granted access to ${conn.peer}`);
            } catch (error) {
              console.error('Error sending file:', error);
              toast.error("Error sending file");
            }
          } else {
            conn.send({
              type: 'permission-denied'
            });
            toast.info(`Denied access to ${conn.peer}`);
          }
        }
      });

      conn.on('error', (error) => {
        console.error('Connection error:', error);
        toast.error("Connection error occurred");
      });
    });

    newPeer.on('error', (error) => {
      console.error('PeerJS error:', error);
      toast.error("Connection error. Please try again.");
      setIsConnected(false);
    });

    setPeer(newPeer);

    return () => {
      newPeer.destroy();
    };
  }, [currentFile]);

  // Store file and generate token when uploading
  const handleFileSelect = (file: File) => {
    setCurrentFile(file);
    const newPeerId = generatePeerId();
    
    if (peer) {
      peer.destroy();
    }

    const newPeer = new Peer(newPeerId);

    newPeer.on('open', () => {
      setPeerId(newPeerId);
      setIsConnected(true);
      toast.success(`File ready to share! Your token is: ${newPeerId}`);
    });

    newPeer.on('connection', (conn) => {
      console.log('New connection in handleFileSelect:', conn.peer);
      
      conn.on('data', async (data: { type: string, requestedFile?: string }) => {
        console.log('Received data in handleFileSelect:', data);
        
        if (data.type === 'request-permission') {
          const isApproved = window.confirm(`User ${conn.peer} wants to download your file. Allow?`);
          
          if (isApproved && file) {
            try {
              const buffer = await file.arrayBuffer();
              conn.send({
                type: 'permission-granted',
                fileData: buffer,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
              });
              toast.success(`Granted access to ${conn.peer}`);
            } catch (error) {
              console.error('Error sending file:', error);
              toast.error("Error sending file");
            }
          } else {
            conn.send({
              type: 'permission-denied'
            });
            toast.info(`Denied access to ${conn.peer}`);
          }
        }
      });

      conn.on('error', (error) => {
        console.error('Connection error:', error);
        toast.error("Connection error occurred");
      });
    });

    newPeer.on('error', (error) => {
      console.error('PeerJS error:', error);
      toast.error("Connection error. Please try again.");
      setIsConnected(false);
    });

    setPeer(newPeer);
  };

  // Handle peer ID submission for downloading
  const handlePeerConnect = async (remotePeerId: string) => {
    if (!peer || !remotePeerId) {
      toast.error("Connection not ready. Please try again.");
      return;
    }

    try {
      console.log('Connecting to peer:', remotePeerId);
      const conn = peer.connect(remotePeerId);
      
      conn.on('open', () => {
        console.log('Connection opened to:', remotePeerId);
        toast.info("Requesting permission from sender...");
        conn.send({ type: 'request-permission' });
      });

      conn.on('data', (data: { 
        type: string, 
        fileData?: ArrayBuffer, 
        fileName?: string,
        fileType?: string,
        fileSize?: number 
      }) => {
        console.log('Received data in receiver:', data);
        
        if (data.type === 'permission-granted' && data.fileData && data.fileName) {
          try {
            // Convert ArrayBuffer to Blob with the correct file type
            const blob = new Blob([data.fileData], { type: data.fileType || 'application/octet-stream' });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = data.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast.success("File download started!");
          } catch (error) {
            console.error('Error downloading file:', error);
            toast.error("Error downloading file");
          }
        } else if (data.type === 'permission-denied') {
          toast.error("File access denied by sender");
        }
      });

      conn.on('error', (error) => {
        console.error('Connection error:', error);
        toast.error("Failed to connect to peer");
      });

      setPendingConnections(prev => new Map(prev.set(remotePeerId, conn)));
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.error("Failed to connect to peer");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Wifi className={`w-5 h-5 ${isConnected ? 'text-success' : 'text-gray-400'}`} />
          <span className={`text-sm ${isConnected ? 'text-success' : 'text-gray-400'}`}>
            {isConnected ? 'Connected to P2P Network' : 'Connecting...'}
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Synk Node Network File Sharing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share files securely with peers on your local network.
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition-transform">
              <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Upload</h3>
              <p className="text-gray-600">Drag and drop your files to share</p>
            </div>
            <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition-transform">
              <Shield className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Network</h3>
              <p className="text-gray-600">Direct peer-to-peer sharing</p>
            </div>
            <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:scale-105 transition-transform">
              <Share2 className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Transfer</h3>
              <p className="text-gray-600">Direct device-to-device transfer</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="upload" className="w-full animate-fade-up">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Share File
              </TabsTrigger>
              <TabsTrigger value="download" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Receive File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-0">
              <div className="space-y-8">
                <FileUpload onFileSelect={handleFileSelect} />
                {peerId && currentFile && <TokenDisplay token={peerId} />}
              </div>
            </TabsContent>

            <TabsContent value="download" className="mt-0">
              <TokenInput onSubmit={handlePeerConnect} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Information Sections */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Features</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-indigo-500 mt-0.5" />
                <span>Direct peer-to-peer connection for enhanced privacy</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-indigo-500 mt-0.5" />
                <span>Files never pass through external servers</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-indigo-500 mt-0.5" />
                <span>Sender permission required for each transfer</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Advantages</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <Share2 className="w-5 h-5 text-indigo-500 mt-0.5" />
                <span>Fast local network transfer speeds</span>
              </li>
              <li className="flex items-start gap-2">
                <Share2 className="w-5 h-5 text-indigo-500 mt-0.5" />
                <span>No file size limitations</span>
              </li>
              <li className="flex items-start gap-2">
                <Share2 className="w-5 h-5 text-indigo-500 mt-0.5" />
                <span>Works without internet connection</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 py-8 border-t">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">About the Developer</h3>
            <div className="space-y-2 text-gray-600">
              <p className="font-medium">Sandeep Kasturi</p>
              <p>
                <a 
                  href="https://skavtechs.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  SKAV TECH
                </a>
              </p>
              <p>
                <a 
                  href="https://github.com/sandeepkasturi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </p>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SKAV TECH. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
