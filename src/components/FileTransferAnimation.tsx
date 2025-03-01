
import React, { useEffect, useState } from 'react';
import { FileCheck } from 'lucide-react';

interface FileTransferAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export const FileTransferAnimation: React.FC<FileTransferAnimationProps> = ({ 
  show,
  onComplete
}) => {
  const [animationState, setAnimationState] = useState<'hidden' | 'showing' | 'completed'>('hidden');
  
  useEffect(() => {
    if (show && animationState === 'hidden') {
      setAnimationState('showing');
      
      // Trigger completion after animation finishes
      const timer = setTimeout(() => {
        setAnimationState('completed');
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (!show && animationState !== 'hidden') {
      setAnimationState('hidden');
    }
  }, [show, animationState, onComplete]);
  
  if (animationState === 'hidden') return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div className={`
        relative p-12 bg-white rounded-2xl shadow-2xl
        animate-[scale-in_0.5s_ease-out,wobble_1s_ease-in-out_0.5s]
      `}>
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
          <FileCheck className="text-white h-10 w-10" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Transfer Complete!</h3>
          <p className="text-gray-600">Files have been successfully transferred</p>
        </div>
      </div>
    </div>
  );
};
