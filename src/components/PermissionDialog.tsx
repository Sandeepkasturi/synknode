
import React from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { File } from 'lucide-react';

interface PermissionDialogProps {
  requesterPeerId: string;
  files: File[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  requesterPeerId,
  files,
  onConfirm,
  onCancel
}) => {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  
  // Format bytes to human-readable
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <AlertDialog defaultOpen={true}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">File Sharing Request</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            <span className="font-semibold text-primary">{requesterPeerId}</span> wants to download your files
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4 max-h-48 overflow-y-auto p-2 border rounded-md">
          <h4 className="font-medium text-sm mb-2">Files to share ({files.length}):</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center text-sm">
                <File className="h-4 w-4 mr-2 text-indigo-500" />
                <span className="truncate">{file.name}</span>
                <span className="ml-auto text-xs text-gray-500">{formatBytes(file.size)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-2 border-t text-right text-xs">
            Total size: <span className="font-semibold">{formatBytes(totalSize)}</span>
          </div>
        </div>
        
        <AlertDialogFooter className="sm:justify-center sm:space-x-4">
          <AlertDialogCancel 
            onClick={onCancel}
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          >
            Deny Access
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Allow Access
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
