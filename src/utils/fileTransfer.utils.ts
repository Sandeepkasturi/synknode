
import { MAX_FILE_SIZE, MAX_USERS_PER_HOUR } from '../types/fileTransfer.types';
import { toast } from 'sonner';

// Track hourly user count in localStorage
const getHourlyUserData = (): { users: string[]; hour: string } => {
  const stored = localStorage.getItem('hourly_user_count');
  if (stored) {
    const parsed = JSON.parse(stored);
    const currentHour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    if (parsed.hour === currentHour) return parsed;
  }
  return { users: [], hour: new Date().toISOString().slice(0, 13) };
};

export const registerUserForHour = (userName: string): boolean => {
  const current = getHourlyUserData();
  if (!current.users.includes(userName)) {
    if (current.users.length >= MAX_USERS_PER_HOUR) {
      toast.error(`Hourly limit of ${MAX_USERS_PER_HOUR} users reached. Try again later.`);
      return false;
    }
    current.users.push(userName);
    localStorage.setItem('hourly_user_count', JSON.stringify(current));
  }
  return true;
};

export const getRemainingHourlySlots = (): number => {
  const current = getHourlyUserData();
  return Math.max(0, MAX_USERS_PER_HOUR - current.users.length);
};

// Process directory entries recursively to extract files
export const processDirectoryEntry = (entry: FileSystemDirectoryEntry): Promise<File[]> => {
  return new Promise((resolve) => {
    const reader = entry.createReader();
    const files: File[] = [];
    
    const readEntries = () => {
      reader.readEntries(async (entries) => {
        if (entries.length === 0) {
          resolve(files);
          return;
        }
        
        for (const entry of entries) {
          if (entry.isFile) {
            const fileEntry = entry as FileSystemFileEntry;
            await new Promise<void>((fileResolve) => {
              fileEntry.file((file) => {
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
        
        readEntries();
      });
    };
    
    readEntries();
  });
};

// Validate files against size limit (5GB total per user)
export const validateFiles = (files: File[]): File[] => {
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_FILE_SIZE) {
    toast.error(`Total file size exceeds 5GB limit`);
    return [];
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
