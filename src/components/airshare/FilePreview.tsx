
import React from 'react';
import { useAirShare } from '@/context/AirShareContext';
import { motion } from 'framer-motion';
import { FileIcon, ImageIcon } from 'lucide-react';

export const FilePreview: React.FC = () => {
  const { previewUrls, previewFiles, isReceivingFile } = useAirShare();

  if (previewUrls.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg bg-gray-50">
        <div className="text-gray-400">
          {isReceivingFile ? 'Receiving files...' : 'No files shared yet'}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {previewUrls.map((url, index) => {
        const file = previewFiles[index];
        const isImage = file && file.type.startsWith('image/');
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border rounded-lg overflow-hidden bg-white shadow-sm"
          >
            {isImage ? (
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={url}
                  alt={file.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-gray-50">
                {file.type.includes('pdf') ? (
                  <embed 
                    src={url} 
                    type="application/pdf" 
                    className="w-full h-full"
                    title={file.name}
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-3">
                      {file.type.includes('text') || file.type.includes('document') ? (
                        <FileIcon className="h-8 w-8 text-gray-500" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                    <p className="font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="p-3 border-t bg-gray-50">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-gray-500 flex justify-between mt-1">
                <span>{file.type || 'Unknown type'}</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
