// Service worker: receives files from Android's Share menu and keeps navigations network-first.
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { get, set } from "idb-keyval";

const sw = self as any;
const INBOX_KEY = "share-inbox-v2";
const EXPIRY_MS = 24 * 60 * 60 * 1000;
const MAX_FILE_BYTES = 5 * 1024 * 1024 * 1024;
const MAX_FILES = 50;
const createId = () => crypto.randomUUID();

sw.addEventListener("install", () => sw.skipWaiting());
sw.addEventListener("activate", (event: any) => event.waitUntil((async () => {
  const shares = ((await get(INBOX_KEY)) as any[]) || [];
  const active = shares.filter(share => share.expiresAt > Date.now() && share.items?.some((item: any) => item.status !== "uploaded"));
  await set(INBOX_KEY, active);
  await sw.clients.claim();
})()));

sw.addEventListener("fetch", (event: any) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "POST" || url.pathname !== "/share-target") return;
  event.respondWith((async () => {
    const receivedAt = Date.now();
    const shareId = createId();
    const form = await event.request.formData();
    const files = form.getAll("files").filter((value: unknown) => value instanceof File).slice(0, MAX_FILES) as File[];
    const validFiles = files.filter(file => file.size > 0 && file.size <= MAX_FILE_BYTES && file.name.length <= 255);
    const existing = ((await get(INBOX_KEY)) as any[]) || [];
    const items = validFiles.map(file => ({ id: createId(), shareId, name: file.name || "shared-file", type: file.type || "application/octet-stream", size: file.size, lastModified: file.lastModified || receivedAt, blob: file, status: "pending" }));
    const text = String(form.get("text") || "").slice(0, 10000);
    const title = String(form.get("title") || "").slice(0, 500);
    const sharedUrl = String(form.get("url") || "").slice(0, 2048);
    if (text || title || sharedUrl) items.push({ id: createId(), shareId, name: title || "Shared text", type: "text/plain", size: text.length + sharedUrl.length, lastModified: receivedAt, blob: new Blob([text + (sharedUrl ? `\n${sharedUrl}` : "")], { type: "text/plain" }), status: "pending" });
    await set(INBOX_KEY, [...existing, { id: shareId, title, text, url: sharedUrl, receivedAt, expiresAt: receivedAt + EXPIRY_MS, items }]);
    return Response.redirect("/incoming-shares", 303);
  })().catch(() => Response.redirect("/incoming-shares?error=receive", 303)));
});

cleanupOutdatedCaches();
precacheAndRoute((self.__WB_MANIFEST || []).filter((entry: any) => !String(typeof entry === "string" ? entry : entry.url).endsWith(".html")));
registerRoute(new NavigationRoute(new NetworkFirst({ cacheName: "pages", networkTimeoutSeconds: 5 }), { denylist: [/^\/~oauth/, /^\/share-target/] }));
