
import { useState, useEffect } from "react";
import { Check, Copy, Share, Wifi } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface TokenDisplayProps {
  token: string;
}

export const TokenDisplay = ({ token }: TokenDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setIsAnimating(true);
      toast.success("Token copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy token");
    }
  };

  useEffect(() => {
    // Add entrance animation when component mounts
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      className="w-full max-w-md mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 bg-gradient-to-br from-white/70 to-indigo-50/70 backdrop-blur-sm border rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">Share Token</h3>
          <Wifi className="h-5 w-5 text-indigo-500" />
        </div>
        
        <motion.div 
          className="flex items-center space-x-2"
          animate={{ scale: isAnimating ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <code className="flex-1 p-3 bg-white rounded text-sm font-mono tracking-wider text-indigo-800 border border-indigo-100">
            {token.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </code>
          <motion.button
            onClick={copyToClipboard}
            className="p-2 hover:bg-indigo-100 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {copied ? (
              <Check className="h-5 w-5 text-success" />
            ) : (
              <Copy className="h-5 w-5 text-indigo-500" />
            )}
          </motion.button>
        </motion.div>
        
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Share this token with the recipient to allow file access
          </p>
          <motion.button
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
          >
            <Share className="h-3 w-3" />
            Share
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
