import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { FileIcon, X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueueFile } from "@/types/queue.types";

interface FilePreviewProps {
  file: QueueFile | null;
  senderName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getFileCategory = (type: string, name: string): 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'unknown' => {
  const lower = type.toLowerCase();
  const ext = name.split('.').pop()?.toLowerCase() || '';

  if (lower.startsWith('image/')) return 'image';
  if (lower === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (lower.startsWith('video/')) return 'video';
  if (lower.startsWith('audio/')) return 'audio';
  if (
    lower.startsWith('text/') ||
    ['json', 'xml', 'csv', 'md', 'txt', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py', 'java', 'c', 'cpp', 'h', 'yaml', 'yml', 'toml', 'log', 'sh', 'bat', 'sql'].includes(ext)
  ) return 'text';

  return 'unknown';
};

export const FilePreview: React.FC<FilePreviewProps> = ({ file, senderName, open, onOpenChange }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !file) {
      setBlobUrl(null);
      setTextContent(null);
      setError(null);
      return;
    }

    const loadFile = async () => {
      setLoading(true);
      setError(null);

      try {
        let blob: Blob | null = null;

        if (file.blob) {
          blob = file.blob;
        } else if (file.storagePath) {
          const { data, error: dlError } = await supabase.storage
            .from('pending-files')
            .download(file.storagePath);
          if (dlError) throw dlError;
          blob = data;
        }

        if (!blob) {
          setError("Unable to load file");
          return;
        }

        const category = getFileCategory(file.type, file.name);

        if (category === 'text') {
          const text = await blob.text();
          setTextContent(text.slice(0, 100000)); // Limit to 100k chars
        } else {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
        }
      } catch (err) {
        console.error('Preview error:', err);
        setError("Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [open, file]);

  if (!file) return null;

  const category = getFileCategory(file.type, file.name);

  const handleDownload = () => {
    if (!blobUrl && !textContent) return;
    const url = blobUrl || URL.createObjectURL(new Blob([textContent || '']));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${senderName}_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!blobUrl) URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm font-medium text-foreground flex items-center gap-2 truncate pr-4">
              <FileIcon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate">{file.name}</span>
            </DialogTitle>
            <Button size="sm" variant="ghost" onClick={handleDownload} className="flex-shrink-0 text-xs">
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <FileIcon className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">{error}</p>
            </div>
          ) : category === 'image' && blobUrl ? (
            <div className="flex items-center justify-center p-4 bg-secondary/20">
              <img
                src={blobUrl}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          ) : category === 'pdf' && blobUrl ? (
            <iframe
              src={blobUrl}
              className="w-full h-[70vh] border-0"
              title={file.name}
            />
          ) : category === 'video' && blobUrl ? (
            <div className="flex items-center justify-center p-4 bg-black/5">
              <video
                src={blobUrl}
                controls
                className="max-w-full max-h-[70vh] rounded-lg"
              >
                Your browser does not support video playback.
              </video>
            </div>
          ) : category === 'audio' && blobUrl ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <FileIcon className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <audio src={blobUrl} controls className="w-full max-w-md" />
            </div>
          ) : category === 'text' && textContent !== null ? (
            <pre className="p-4 text-xs font-mono text-foreground bg-secondary/20 overflow-auto whitespace-pre-wrap break-words max-h-[70vh]">
              {textContent}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <FileIcon className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">Preview not available</p>
              <p className="text-xs">Download the file to view it</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
