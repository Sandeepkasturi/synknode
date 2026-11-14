// Receives Android Share Sheet files and otherwise leaves requests to the browser.
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { get, set } from "idb-keyval";
import { partitionSharedFiles } from "./lib/shareIntake";

type PrecacheEntry = string | { url: string };
type WorkerLifecycleEvent = Event & { waitUntil(promise: Promise<unknown>): void };
type WorkerFetchEvent = Event & { request: Request; respondWith(response: Promise<Response> | Response): void };
type ServiceWorkerRuntime = {
  addEventListener(type: "install" | "activate", listener: (event: WorkerLifecycleEvent) => void): void;
  addEventListener(type: "fetch", listener: (event: WorkerFetchEvent) => void): void;
  skipWaiting(): Promise<void>;
  clients: { claim(): Promise<void> };
  __WB_MANIFEST: PrecacheEntry[];
};
const sw = globalThis as unknown as ServiceWorkerRuntime;

const INBOX_KEY = "share-inbox-v2";
const EXPIRY_MS = 24 * 60 * 60 * 1000;
const createId = () => crypto.randomUUID();

sw.addEventListener("install", event => event.waitUntil(sw.skipWaiting()));
sw.addEventListener("activate", event => event.waitUntil((async () => {
  const shares = (await get<Array<{ expiresAt: number; items?: Array<{ status: string }> }>>(INBOX_KEY)) || [];
  const active = shares.filter(share => share.expiresAt > Date.now() && share.items?.some(item => item.status !== "uploaded"));
  await set(INBOX_KEY, active);
  await sw.clients.claim();
})()));

sw.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "POST" || url.pathname !== "/share-target") return;

  event.respondWith((async () => {
    const redirect = (query: string) => Response.redirect(new URL(`/incoming-shares${query}`, url.origin), 303);
    try {
      const form = await event.request.formData();
      // The manifest names the multi-file field "files". Do not treat unrelated form parts as files.
      const fileParts = form.getAll("files").filter((part): part is File => typeof part !== "string");
      const { accepted, rejected } = partitionSharedFiles(fileParts);
      if (accepted.length === 0) return redirect(`?error=${fileParts.length ? "unsupported" : "empty"}`);

      const receivedAt = Date.now();
      const shareId = createId();
      const items = accepted.map(file => ({
        id: createId(),
        shareId,
        name: file.name || "shared-file",
        type: file.type || "application/octet-stream",
        size: file.size,
        lastModified: file.lastModified || receivedAt,
        blob: file,
        status: "pending" as const,
      }));

      const existing = (await get<Array<{ id: string; expiresAt: number; items: Array<{ status: string }> }>>(INBOX_KEY)) || [];
      const active = existing.filter(share => share.expiresAt > receivedAt && share.items.some(item => item.status !== "uploaded"));
      await set(INBOX_KEY, [...active, { id: shareId, receivedAt, expiresAt: receivedAt + EXPIRY_MS, items }]);
      const issueCount = rejected.length;
      return redirect(`?share=${encodeURIComponent(shareId)}${issueCount ? `&rejected=${issueCount}` : ""}`);
    } catch {
      return redirect("?error=storage");
    }
  })());
});

cleanupOutdatedCaches();
const precacheManifest = sw.__WB_MANIFEST ?? [];
precacheAndRoute(precacheManifest.filter(entry => !String(typeof entry === "string" ? entry : entry.url).endsWith(".html")));
registerRoute(new NavigationRoute(new NetworkFirst({ cacheName: "pages", networkTimeoutSeconds: 5 }), { denylist: [/^\/~oauth/, /^\/share-target/] }));
