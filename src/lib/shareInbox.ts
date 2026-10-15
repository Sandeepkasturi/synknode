import { get, del } from "idb-keyval";

interface InboxItem { name: string; type: string; lastModified?: number; blob: Blob }

/** Files handed to SynkNode by the phone's Share menu (stored by the service worker). */
export async function readShareInbox(): Promise<File[]> {
  const items = ((await get("share-inbox")) as InboxItem[] | undefined) || [];
  return items.map(i => new File([i.blob], i.name, { type: i.type, lastModified: i.lastModified }));
}
export const clearShareInbox = () => del("share-inbox");

/** In-memory hand-off of files between screens (e.g. Share → Direct). */
let outbox: File[] = [];
export const setOutbox = (files: File[]) => { outbox = files; };
export const takeOutbox = () => { const f = outbox; outbox = []; return f; };
