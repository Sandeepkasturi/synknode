
import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Folder } from "lucide-react";
import { toast } from "sonner";
import { useFileTransfer } from "../context/FileTransferContext";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDraggingDirectory, setIsDraggingDirectory] = useState(false);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const { handleDirectorySelect } = useFileTransfer();
  
  const processFiles = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const totalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0);
      const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
      
      if (totalSize > MAX_SIZE) {
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

  const handleDirectoryButtonClick = () => {
    if (directoryInputRef.current) {
      directoryInputRef.current.click();
    }
  };

  const handleDirectorySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      processFiles(fileArray);
    }
  };

  const handleDirectoryDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.items) {
      const items = e.dataTransfer.items;
      const entries: FileSystemEntry[] = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            entries.push(entry);
          }
        }
      }
      
      if (entries.length > 0) {
        handleDirectorySelect(entries);
      }
    }
    
    setIsDraggingDirectory(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: isDraggingDirectory,
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
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`relative p-8 border-2 border-dashed rounded-lg transition-all duration-300 
          ${isDragActive
              ? "border-success bg-success/5"
              : isDraggingDirectory
                ? "border-indigo-400 bg-indigo-50"
                : "border-gray-300 hover:border-gray-400"
          }
        `}
        onDragEnter={() => setIsDraggingDirectory(true)}
        onDragLeave={() => setIsDraggingDirectory(false)}
        onDrop={handleDirectoryDrop}
      >
        <input {...getInputProps()} />
        <input
          type="file"
          ref={directoryInputRef}
          webkitdirectory="true"
          directory=""
          style={{ display: 'none' }}
          onChange={handleDirectorySelect}
        />
        
        {selectedFiles.length === 0 ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag & drop files here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-500">
              You can select multiple files
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDirectoryButtonClick();
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Folder className="mr-2 h-4 w-4" />
              Select Directory
            </button>
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="flex flex-col space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-lg border">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <File className="h-5 w-5 text-gray-500 flex-shrink-0" />
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
              <div className="mt-4 grid grid-cols-2 gap-2">
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
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectoryButtonClick();
                }}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Folder className="mr-1 h-3 w-3" />
                Add Directory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
