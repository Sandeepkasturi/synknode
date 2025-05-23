
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileImage, FileText, Upload, Maximize, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { usePeer } from '../context/PeerContext';
import { useAirShare } from '../context/AirShareContext';

const Sharomatic: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [viewToken, setViewToken] = useState<string>('');
  const [presentationUrl, setPresentationUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('share');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get peer functionality from context
  const { peer, peerId, isConnected: isPeerConnected } = usePeer();
  const { 
    generateNewCode, 
    connectCode, 
    connectWithCode, 
    previewFiles, 
    previewUrls, 
    uploadFiles, 
    clearFiles 
  } = useAirShare();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Generate a connection code for sharing
      generateNewCode();
      
      // Upload file for sharing
      uploadFiles([selectedFile]);
      
      toast.success(`File ready to present!`);
    }
  };

  // Connect to presenter using the token
  const handleViewPresentation = async () => {
    if (!viewToken) {
      toast.error("Please enter a valid 6-digit token");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Connect to the peer with the provided token
      const success = await connectWithCode(viewToken);
      
      if (success) {
        setActiveTab('view');
        toast.success("Connected successfully! Loading presentation...");
      } else {
        toast.error("Invalid token or presentation has expired");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Connection error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const presentationElement = document.getElementById('presentation-view');
      if (presentationElement) {
        presentationElement.requestFullscreen().catch(err => {
          toast.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Monitor preview files from AirShare to show the presentation
  useEffect(() => {
    if (previewFiles.length > 0 && previewUrls.length > 0) {
      const currentFile = previewFiles[0];
      const currentUrl = previewUrls[0];
      
      setFileName(currentFile.name);
      setFileType(currentFile.type);
      setPresentationUrl(currentUrl);
    }
  }, [previewFiles, previewUrls]);

  // Clean up URLs when component unmounts - FIX: Add proper dependency array to prevent infinite updates
  useEffect(() => {
    return () => {
      if (clearFiles) {
        clearFiles();
      }
    };
  }, []); // Intentionally empty array to run only on mount/unmount

  const renderFilePreview = () => {
    if (!presentationUrl) return null;

    if (fileType && fileType.includes('pdf')) {
      return (
        <object
          data={presentationUrl}
          type="application/pdf"
          className="w-full h-[70vh] border rounded-lg"
          title={fileName || 'PDF Presentation'}
        >
          <p>Unable to display PDF. <a href={presentationUrl} target="_blank" rel="noopener noreferrer">Download</a> instead.</p>
        </object>
      );
    } else if (fileType && fileType.includes('image')) {
      return (
        <img 
          src={presentationUrl} 
          alt={fileName || 'Image Presentation'}
          className="max-w-full max-h-[70vh] mx-auto object-contain border rounded-lg"
        />
      );
    } else if (fileType && fileType.includes('video')) {
      return (
        <video 
          src={presentationUrl} 
          controls 
          className="max-w-full max-h-[70vh] mx-auto border rounded-lg"
        >
          Your browser does not support the video tag.
        </video>
      );
    } else if (fileType && (fileType.includes('presentation') || fileType.includes('powerpoint') || fileType.includes('pptx'))) {
      return (
        <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center p-8">
            <FileText className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
            <h3 className="text-xl font-semibold mb-2">{fileName || 'Presentation'}</h3>
            <p className="text-gray-500 mb-4">PowerPoint presentations require Google Slides or Office Online for viewing</p>
            <a 
              href={presentationUrl} 
              download={fileName}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Download Presentation
            </a>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center p-8">
            <FileImage className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
            <h3 className="text-xl font-semibold mb-2">{fileName || 'File'}</h3>
            <p className="text-gray-500 mb-4">This file type cannot be previewed directly</p>
            <a 
              href={presentationUrl} 
              download={fileName}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Download File
            </a>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 pt-12 pb-24">
        <div className="mb-8 flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Sharomatic</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Share and present files instantly with anyone, anywhere
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-3xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="share">Share Content</TabsTrigger>
            <TabsTrigger value="view">View Presentation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="share">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-8">
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                      Select a file to present
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-indigo-300 border-dashed rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-indigo-500" />
                          <p className="mb-2 text-sm text-gray-700">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            Presentations, PDFs, images, videos
                          </p>
                        </div>
                        <input 
                          id="file-upload" 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileChange} 
                        />
                      </label>
                    </div>
                  </div>

                  {connectCode && (
                    <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
                      <h3 className="text-center font-medium text-lg text-indigo-800 mb-3">
                        Your Presentation Token
                      </h3>
                      <div className="flex justify-center items-center gap-4 mb-3">
                        {connectCode.split('').map((char, i) => (
                          <div
                            key={i}
                            className="w-12 h-12 flex items-center justify-center rounded-lg bg-white border-2 border-indigo-300 text-xl font-bold text-indigo-800"
                          >
                            {char}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-center text-gray-600">
                        Share this token with viewers to let them see your presentation
                      </p>
                      <div className="mt-4 flex justify-center">
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(connectCode);
                            toast.success("Token copied to clipboard!");
                          }}
                          className="flex items-center gap-2"
                        >
                          <QrCode className="h-4 w-4" />
                          Copy Token
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="view">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {!presentationUrl ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-5 py-8">
                      <h3 className="text-lg font-medium">Enter Presentation Token</h3>
                      <div className="flex gap-2 mb-4">
                        <Input
                          type="text"
                          value={viewToken}
                          onChange={(e) => setViewToken(e.target.value.toUpperCase())}
                          maxLength={6}
                          className="text-center text-xl font-mono tracking-wider"
                          placeholder="XXXXXX"
                        />
                      </div>
                      <Button 
                        onClick={handleViewPresentation}
                        disabled={viewToken.length !== 6 || isLoading}
                        className="flex items-center gap-2"
                      >
                        {isLoading ? 'Connecting...' : 'See Presentation'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      Presentation View
                    </h2>
                    <Button
                      variant="outline"
                      onClick={toggleFullscreen}
                      className="flex items-center gap-1"
                    >
                      <Maximize className="h-4 w-4" />
                      {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </Button>
                  </div>
                  
                  <div 
                    id="presentation-view"
                    className="bg-white rounded-lg shadow-lg p-4 overflow-hidden"
                  >
                    {renderFilePreview()}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Sharomatic;
