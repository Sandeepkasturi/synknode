
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
      
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      toast.success("File selected successfully");
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`relative p-8 border-2 border-dashed rounded-lg transition-all duration-300 
          ${
            isDragActive
              ? "border-success bg-success/5"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        <input {...getInputProps()} />
        {!selectedFile ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag & drop a file here, or click to select
            </p>
          </div>
        ) : (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-lg border">
              <div className="flex items-center space-x-3">
                <File className="h-6 w-6 text-gray-500" />
                <div className="text-sm text-gray-600 truncate">
                  {selectedFile.name}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            {preview && (
              <div className="mt-4 relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
