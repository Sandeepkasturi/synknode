import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAirShare } from '@/context/AirShareContext';

export const FileDropZone: React.FC = () => {
  const { uploadFiles, previewFiles, clearFiles } = useAirShare();
  const [isWobbling, setIsWobbling] = useState(false);
  const wobbleTimeoutRef = useRef<number | null>(null);
  
  // Start wobbling animation when files are dragged over
  const onDragOver = useCallback(() => {
    if (!isWobbling) {
      setIsWobbling(true);
    }
    
    // Reset the timeout to keep wobbling while dragging
    if (wobbleTimeoutRef.current) {
      window.clearTimeout(wobbleTimeoutRef.current);
    }
    
    // Stop wobbling after a short delay when drag stops
    wobbleTimeoutRef.current = window.setTimeout(() => {
      setIsWobbling(false);
    }, 1500);
  }, [isWobbling]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (wobbleTimeoutRef.current) {
        window.clearTimeout(wobbleTimeoutRef.current);
      }
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadFiles(acceptedFiles);
    }
    setIsWobbling(false);
  }, [uploadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragOver
  });

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <motion.div
        animate={isWobbling ? "wobble" : "idle"}
        variants={{
          idle: { 
            scale: 1, 
            rotate: 0 
          },
          wobble: {
            scale: [1, 1.03, 0.97, 1.02, 0.98, 1],
            rotate: [0, -2, 3, -2, 1, 0],
            transition: { duration: 0.8, ease: "easeInOut" }
          }
        }}
        className={`
          relative overflow-hidden rounded-2xl transition-colors duration-300
          ${isDragActive 
            ? 'bg-indigo-50 border-4 border-indigo-300 border-dashed shadow-lg' 
            : previewFiles.length > 0 
              ? 'bg-white border-4 border-green-200 shadow-md' 
              : 'bg-white border-4 border-gray-200 border-dashed hover:border-indigo-200'
          }
        `}
      >
        <div
          {...getRootProps()}
          className="p-8 flex flex-col items-center justify-center text-center min-h-[280px]"
        >
          <input {...getInputProps()} />
          
          {previewFiles.length === 0 ? (
            <>
              <div className="w-16 h-16 mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
                <Upload className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">
                Drop files here to share
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Files will immediately appear on the connected device for preview
              </p>
            </>
          ) : (
            <div className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Shared Files ({previewFiles.length})
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFiles();
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previewFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith('image/') ? (
                      <div className="aspect-square rounded-lg overflow-hidden border bg-gray-50">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg border bg-gray-50 flex items-center justify-center">
                        <div className="text-center p-2">
                          <div className="w-10 h-10 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium uppercase">
                              {file.name.split('.').pop()}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-600 truncate max-w-full">
                            {file.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Drop more files to share them instantly
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
