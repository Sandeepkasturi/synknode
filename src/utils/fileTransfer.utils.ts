
import { MAX_FILE_SIZE } from '../types/fileTransfer.types';
import { toast } from 'sonner';

// Process directory entries recursively to extract files
export const processDirectoryEntry = (entry: FileSystemDirectoryEntry): Promise<File[]> => {
  return new Promise((resolve) => {
    const reader = entry.createReader();
    const files: File[] = [];
    
    // Function to read all entries in the directory
    const readEntries = () => {
      reader.readEntries(async (entries) => {
        if (entries.length === 0) {
          resolve(files);
          return;
        }
        
        // Process each entry
        for (const entry of entries) {
          if (entry.isFile) {
            const fileEntry = entry as FileSystemFileEntry;
            await new Promise<void>((fileResolve) => {
              fileEntry.file((file) => {
                // Add path info to the file
                const fileWithPath = Object.defineProperty(file, 'path', {
                  value: fileEntry.fullPath,
                  writable: true
                });
                files.push(fileWithPath);
                fileResolve();
              });
            });
          } else if (entry.isDirectory) {
            const subFiles = await processDirectoryEntry(entry as FileSystemDirectoryEntry);
            files.push(...subFiles);
          }
        }
        
        // Continue reading if more entries exist
        readEntries();
      });
    };
    
    readEntries();
  });
};

// Validate files against size limit
export const validateFiles = (files: File[]): File[] => {
  // Check if any file exceeds max size
  const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
  if (oversizedFiles.length > 0) {
    toast.error(`${oversizedFiles.length} file(s) exceed the 2GB limit and can't be transferred`);
    // Filter out oversized files
    const validFiles = files.filter(file => file.size <= MAX_FILE_SIZE);
    if (validFiles.length === 0) {
      return [];
    }
    return validFiles;
  }
  return files;
};

// Helper to create a download link for a file
export const downloadFile = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
