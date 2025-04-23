
import React, { useState, useEffect } from 'react';
import { RefreshCcw, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAirShare } from '@/context/AirShareContext';
import { toast } from 'sonner';
import { validateCode } from '@/utils/codeGenerator';

export const ConnectionCode: React.FC = () => {
  const { connectCode, generateNewCode, connectWithCode, isConnected, isConnecting } = useAirShare();
  const [inputCode, setInputCode] = useState('');
  const [isValidInput, setIsValidInput] = useState(false);

  // Validate input code on change
  useEffect(() => {
    setIsValidInput(validateCode(inputCode));
  }, [inputCode]);

  // Handle code generation
  const handleGenerateCode = () => {
    generateNewCode();
  };

  // Handle connection with entered code
  const handleConnect = async () => {
    if (!isValidInput) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    const success = await connectWithCode(inputCode);
    if (success) {
      setInputCode('');
    }
  };

  // Copy code to clipboard
  const copyCodeToClipboard = () => {
    if (connectCode) {
      navigator.clipboard.writeText(connectCode);
      toast.success("Code copied to clipboard!");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Connect Devices</CardTitle>
        <CardDescription>
          Generate a code on one device and enter it on the other
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generate Code Section */}
        <div>
          <div className="text-sm font-medium mb-2">Generate a code to share:</div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              {connectCode ? (
                <div className="bg-indigo-50 border text-center py-2 px-4 rounded-md">
                  <span className="text-2xl font-mono tracking-wider select-all">{connectCode}</span>
                </div>
              ) : (
                <div className="border text-center py-2 px-4 rounded-md bg-gray-50">
                  <span className="text-gray-400">No code generated</span>
                </div>
              )}
            </div>
            
            {!isConnected && (
              <Button 
                onClick={handleGenerateCode} 
                variant="outline" 
                size="icon"
                title="Generate new code"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            )}
            
            {connectCode && (
              <Button
                onClick={copyCodeToClipboard}
                variant="outline"
                size="icon"
                title="Copy code"
              >
                <Link className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Connect with Code Section */}
        {!isConnected && (
          <div>
            <div className="text-sm font-medium mb-2">Or connect with a code:</div>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="flex-1 text-lg tracking-wider text-center font-mono"
                maxLength={6}
              />
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting || !isValidInput}
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>
        )}
        
        {/* Connection Status */}
        {isConnected && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
            <span className="text-green-600 flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Devices connected
            </span>
          </div>
        )}
      </CardContent>
      {isConnected && (
        <CardFooter>
          <div className="text-sm text-gray-500 w-full text-center">
            Start sharing files by dragging them onto the drop area
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
