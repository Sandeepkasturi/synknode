
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
            Local Network File Sharing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share files securely with peers on your local network. No internet required!
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

        {/* Footer */}
        <footer className="mt-24 text-center text-gray-500 text-sm">
          <p>Local network file sharing application. Share responsibly.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
