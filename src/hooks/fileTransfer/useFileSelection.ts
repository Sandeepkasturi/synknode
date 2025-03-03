
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { MAX_FILE_SIZE, FileSystemEntry } from "../../types/fileTransfer.types";

export const useFileSelection = () => {
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);

  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > MAX_FILE_SIZE) {
        toast.error("Total file size exceeds the maximum limit of 2GB.");
        return;
      }
      setCurrentFiles(files);
      toast.success(`${files.length} files selected`);
    }
  }, []);

  // Handle directory selection
  const handleDirectorySelect = useCallback(async (entries: FileSystemEntry[]) => {
    const files: File[] = [];

    async function processEntries(entries: FileSystemEntry[]) {
      for (const entry of entries) {
        if (entry.isFile) {
          await new Promise<void>((resolve) => {
            entry.file!(file => {
              if (file.size <= MAX_FILE_SIZE) {
                files.push(file);
              } else {
                toast.error(`File ${file.name} exceeds the maximum file size of 2GB.`);
              }
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          if (entry.createReader) {
            const reader = entry.createReader();
            await new Promise<void>((resolve) => {
              reader.readEntries(async (newEntries) => {
                await processEntries(newEntries);
                resolve();
              });
            });
          } else {
            console.warn("Directory entry does not have a createReader method:", entry);
          }
        }
      }
    }

    await processEntries(entries);

    if (files.length > 0) {
      setCurrentFiles(files);
      toast.success(`${files.length} files selected from directory`);
    } else {
      toast.info("No files found in the selected directory or files exceed the maximum size limit.");
    }
  }, []);

  return {
    currentFiles,
    setCurrentFiles,
    handleFileSelect,
    handleDirectorySelect
  };
};
