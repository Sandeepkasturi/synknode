import { del, get, set } from "idb-keyval";

export type ShareItemStatus = "pending" | "uploading" | "uploaded" | "failed";

export interface IncomingShareItem {
  id: string;
  shareId: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  blob: Blob;
  status: ShareItemStatus;
  error?: string;
}

export interface IncomingShare {
  id: string;
  title?: string;
  text?: string;
  url?: string;
  receivedAt: number;
  expiresAt: number;
  userId?: string;
  items: IncomingShareItem[];
}

const INBOX_KEY = "share-inbox-v2";
const LEGACY_KEY = "share-inbox";
const EXPIRY_MS = 24 * 60 * 60 * 1000;

const createId = () => crypto.randomUUID();

async function removeExpired(shares: IncomingShare[]) {
  const now = Date.now();
  const active = shares.filter(share => share.expiresAt > now && share.items.some(item => item.status !== "uploaded"));
  if (active.length !== shares.length) await set(INBOX_KEY, active);
  return active;
}

async function migrateLegacy(): Promise<IncomingShare[]> {
  const legacy = await get<Array<{ name: string; type: string; lastModified?: number; blob: Blob }>>(LEGACY_KEY);
  if (!legacy?.length) return [];
  const shareId = createId();
  const receivedAt = Date.now();
  const share: IncomingShare = {
    id: shareId,
    receivedAt,
    expiresAt: receivedAt + EXPIRY_MS,
    items: legacy.map(item => ({ id: createId(), shareId, name: item.name || "shared-file", type: item.type || "application/octet-stream", size: item.blob.size, lastModified: item.lastModified || receivedAt, blob: item.blob, status: "pending" })),
  };
  await set(INBOX_KEY, [share]);
  await del(LEGACY_KEY);
  return [share];
}

export async function readIncomingShares() {
  const stored = await get<IncomingShare[]>(INBOX_KEY);
  const shares = stored?.length ? stored : await migrateLegacy();
  return removeExpired(shares || []);
}

export async function addIncomingShare(input: Omit<IncomingShare, "id" | "receivedAt" | "expiresAt">) {
  const shares = await readIncomingShares();
  const receivedAt = Date.now();
  const id = createId();
  const share: IncomingShare = {
    ...input,
    id,
    receivedAt,
    expiresAt: receivedAt + EXPIRY_MS,
    items: input.items.map(item => ({ ...item, shareId: id })),
  };
  await set(INBOX_KEY, [...shares, share]);
  return share;
}

export async function updateIncomingItem(shareId: string, itemId: string, patch: Partial<IncomingShareItem>) {
  const shares = await readIncomingShares();
  const updated = shares.map(share => share.id !== shareId ? share : { ...share, items: share.items.map(item => item.id === itemId ? { ...item, ...patch } : item) });
  await set(INBOX_KEY, updated);
  return updated;
}

export async function removeIncomingItem(shareId: string, itemId: string) {
  const shares = await readIncomingShares();
  const updated = shares.map(share => share.id !== shareId ? share : { ...share, items: share.items.filter(item => item.id !== itemId) }).filter(share => share.items.length);
  await set(INBOX_KEY, updated);
}

export async function clearIncomingShares() { await del(INBOX_KEY); await del(LEGACY_KEY); }

export async function associateIncomingShares(userId: string) {
  const shares = await readIncomingShares();
  const updated = shares.map(share => ({ ...share, userId }));
  await set(INBOX_KEY, updated);
  return updated;
}

export async function readShareInbox(): Promise<File[]> {
  const shares = await readIncomingShares();
  return shares.flatMap(share => share.items.filter(item => item.status !== "uploaded").map(item => new File([item.blob], item.name, { type: item.type, lastModified: item.lastModified })));
}

export const clearShareInbox = clearIncomingShares;

let outbox: File[] = [];
export const setOutbox = (files: File[]) => { outbox = files; };
export const takeOutbox = () => { const files = outbox; outbox = []; return files; };
