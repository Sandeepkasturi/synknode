
import { MAX_FILE_SIZE, MAX_FILES_PER_DAY } from '../types/fileTransfer.types';
import { toast } from 'sonner';

// Track daily file count in localStorage
const getDailyFileCount = (): { count: number; date: string } => {
  const stored = localStorage.getItem('daily_file_count');
  if (stored) {
    const parsed = JSON.parse(stored);
    const today = new Date().toISOString().split('T')[0];
    if (parsed.date === today) return parsed;
  }
  return { count: 0, date: new Date().toISOString().split('T')[0] };
};

export const incrementDailyFileCount = (amount: number): boolean => {
  const current = getDailyFileCount();
  if (current.count + amount > MAX_FILES_PER_DAY) {
    toast.error(`Daily limit of ${MAX_FILES_PER_DAY} files reached. Try again tomorrow.`);
    return false;
  }
  const updated = { count: current.count + amount, date: current.date };
  localStorage.setItem('daily_file_count', JSON.stringify(updated));
  return true;
};

export const getRemainingDailyFiles = (): number => {
  const current = getDailyFileCount();
  return Math.max(0, MAX_FILES_PER_DAY - current.count);
};

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
    toast.error(`${oversizedFiles.length} file(s) exceed the 50MB limit and can't be transferred`);
    const validFiles = files.filter(file => file.size <= MAX_FILE_SIZE);
    if (validFiles.length === 0) {
      return [];
    }
    return validFiles;
  }

  // Check daily limit
  const remaining = getRemainingDailyFiles();
  if (files.length > remaining) {
    toast.error(`Daily limit: only ${remaining} more file(s) allowed today`);
    return files.slice(0, remaining);
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
