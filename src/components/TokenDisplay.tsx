
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface TokenDisplayProps {
  token: string;
}

export const TokenDisplay = ({ token }: TokenDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success("Token copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy token");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8 animate-fade-up">
      <div className="p-6 bg-white/50 backdrop-blur-sm border rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Share Token</h3>
        <div className="flex items-center space-x-2">
          <code className="flex-1 p-3 bg-gray-50 rounded text-sm font-mono">
            {token}
          </code>
          <button
            onClick={copyToClipboard}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {copied ? (
              <Check className="h-5 w-5 text-success" />
            ) : (
              <Copy className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Share this token with the recipient to allow file access
        </p>
      </div>
    </div>
  );
};
