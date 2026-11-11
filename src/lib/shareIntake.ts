export const MAX_SHARED_FILES = 50;
export const MAX_SHARED_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_SHARED_TOTAL_BYTES = 5 * 1024 * 1024 * 1024;

export type ShareFileMetadata = Pick<File, "name" | "size" | "type" | "lastModified">;
export type ShareRejectionReason = "empty" | "file-too-large" | "total-too-large" | "too-many-files";

export interface RejectedShareFile {
  name: string;
  reason: ShareRejectionReason;
}

export function partitionSharedFiles<T extends ShareFileMetadata>(files: readonly T[]) {
  const accepted: T[] = [];
  const rejected: RejectedShareFile[] = [];
  let totalBytes = 0;

  files.forEach((file, index) => {
    if (index >= MAX_SHARED_FILES) {
      rejected.push({ name: file.name, reason: "too-many-files" });
      return;
    }
    if (!Number.isFinite(file.size) || file.size <= 0) {
      rejected.push({ name: file.name, reason: "empty" });
      return;
    }
    if (file.size > MAX_SHARED_FILE_BYTES) {
      rejected.push({ name: file.name, reason: "file-too-large" });
      return;
    }
    if (totalBytes + file.size > MAX_SHARED_TOTAL_BYTES) {
      rejected.push({ name: file.name, reason: "total-too-large" });
      return;
    }

    accepted.push(file);
    totalBytes += file.size;
  });

  return { accepted, rejected, totalBytes };
}