
import { useState, useEffect } from "react";
import { ArrowRight, Link, PlugZap } from "lucide-react";
import { motion } from "framer-motion";

interface TokenInputProps {
  onSubmit: (peerId: string) => void;
}

export const TokenInput = ({ onSubmit }: TokenInputProps) => {
  const [peerId, setPeerId] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(peerId.trim().toUpperCase());
      setPeerId("");
      setIsValid(false);
    }
  };

  const handlePeerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 5) {
      setPeerId(value);
      setIsValid(value.length === 5);
    }
  };

  // Character display for token input
  const renderCharacterBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 5; i++) {
      const char = peerId[i] || "";
      boxes.push(
        <motion.div
          key={i}
          className={`flex items-center justify-center h-12 w-12 text-xl font-bold rounded-md
            ${char ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-50 text-gray-400'}
            ${isFocused && i === peerId.length ? 'ring-2 ring-indigo-500' : 'border border-gray-200'}
          `}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          {char}
        </motion.div>
      );
    }
    return boxes;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Link className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-medium text-gray-900">Connect with Token</h3>
        </div>
        
        <div className="text-sm text-gray-500 mb-4">
          Enter the 5-character token shared by the sender to establish a connection.
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={peerId}
            onChange={handlePeerIdChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="sr-only"
            maxLength={5}
            aria-label="Token input"
          />
          
          <div 
            className="flex justify-center gap-2 p-2 cursor-text"
            onClick={() => document.querySelector('input')?.focus()}
          >
            {renderCharacterBoxes()}
          </div>
          
          <motion.button
            type="submit"
            disabled={!isValid}
            className={`mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-md text-white font-medium transition-colors
              ${isValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}
            `}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
          >
            <PlugZap className="h-5 w-5" />
            Connect
          </motion.button>
        </div>
      </form>
    </div>
  );
};
