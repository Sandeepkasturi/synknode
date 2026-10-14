import type { QueueFile } from '@/types/queue.types';

export interface DownloadDependencies {
  fetchBlob: (path: string) => Promise<Blob>;
  saveBlob: (blob: Blob, name: string) => void;
  removeObject: (path: string) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

/** Delete only after the full file has arrived and the browser download starts. */
export async function deliverAndDelete(file: QueueFile, sender: string, deps: DownloadDependencies) {
  const blob = file.blob ?? (file.storagePath ? await deps.fetchBlob(file.storagePath) : null);
  if (!blob) throw new Error('File content is unavailable');
  deps.saveBlob(blob, `${sender}_${file.name}`);
  if (file.storagePath) await deps.removeObject(file.storagePath);
  if (file.dbId) await deps.deleteRecord(file.dbId);
}