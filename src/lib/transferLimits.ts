export const LIMITS = {
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024,
  MAX_BATCH_SIZE_BYTES: 5 * 1024 * 1024 * 1024,
  DEFAULT_DAILY_LIMIT_GB: 50,
} as const;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  totalBytes: number;
}

export function validateTransferBatch(files: readonly Pick<File, "name" | "size">[]): ValidationResult {
  const errors: string[] = [];
  let totalBytes = 0;

  if (files.length === 0) return { valid: false, errors: ["No files selected."], totalBytes: 0 };

  for (const file of files) {
    totalBytes += file.size;
    if (file.size > LIMITS.MAX_FILE_SIZE_BYTES) {
      errors.push(`"${file.name}" exceeds the 100 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
    }
    if (file.size === 0) errors.push(`"${file.name}" is empty (0 bytes).`);
  }

  if (totalBytes > LIMITS.MAX_BATCH_SIZE_BYTES) {
    errors.push(`Total batch size (${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB) exceeds the 5 GB maximum limit.`);
  }

  return { valid: errors.length === 0, errors, totalBytes };
}
