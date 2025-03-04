
import { useState, useCallback, ChangeEvent } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { toast } from "sonner";
import { useFileTransfer } from "../context/FileTransferContext";
import { MAX_FILE_SIZE } from "@/types/fileTransfer.types";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { handleFileSelect: contextHandleFileSelect } = useFileTransfer();
  
  const processFiles = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const totalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0);
      
      if (totalSize > MAX_FILE_SIZE) {
        toast.warning(`Total file size exceeds 2GB limit. Some files may not transfer properly.`);
      }
      
      setSelectedFiles(acceptedFiles);
      onFileSelect(acceptedFiles);
      
      // Process image previews
      const newPreviews: string[] = [];
      acceptedFiles.forEach(file => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            if (newPreviews.length === acceptedFiles.filter(f => f.type.startsWith("image/")).length) {
              setPreviews(newPreviews);
            }
          };
          reader.readAsDataURL(file);
        }
      });
      
      toast.success(`${acceptedFiles.length} file${acceptedFiles.length === 1 ? '' : 's'} selected`);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
    
    // Update previews if needed
    if (newFiles.length === 0) {
      setPreviews([]);
    }
  };

  return (
    <div className="w-full mx-auto">
      <div
        {...getRootProps()}
        className={`relative p-6 border-2 border-dashed rounded-lg transition-all duration-300 
          ${isDragActive
              ? "border-success bg-success/5"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        <input {...getInputProps()} />
        
        {selectedFiles.length === 0 ? (
          <div className="text-center">
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag & drop files here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-500">
              You can select multiple files
            </p>
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="flex flex-col space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/80 backdrop-blur-sm rounded-lg border">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="text-sm text-gray-600 truncate">
                      {file.name}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
            
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Click or drag to add more files
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
