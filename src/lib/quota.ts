export const USER_SPACE_QUOTA_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB per user
export const TRANSFER_RETENTION_HOURS = 72; // uploads are removed 3 days after upload

export const fitsQuota = (usedBytes: number, incomingBytes: number) => usedBytes + incomingBytes <= USER_SPACE_QUOTA_BYTES;
export const isTransferExpired = (createdAt: Date, now: Date = new Date()) =>
  now.getTime() - createdAt.getTime() > TRANSFER_RETENTION_HOURS * 60 * 60 * 1000;
