// Service worker: receives files from the phone's Share menu and keeps navigations network-first.
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { get, set } from "idb-keyval";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sw = self as any;

sw.addEventListener("install", () => sw.skipWaiting());
sw.addEventListener("activate", (e: any) => e.waitUntil(sw.clients.claim()));

sw.addEventListener("fetch", (event: any) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "POST" || url.pathname !== "/share-target") return;
  event.respondWith((async () => {
    try {
      const form = await event.request.formData();
      const files = form.getAll("files").filter((f: unknown) => f instanceof File) as File[];
      const existing = ((await get("share-inbox")) as unknown[]) || [];
      const items = files.map(f => ({ name: f.name, type: f.type, lastModified: f.lastModified, blob: f }));
      await set("share-inbox", [...existing, ...items]);
    } catch (e) {
      console.error("share-target failed", e);
    }
    return Response.redirect("/share", 303);
  })());
});

cleanupOutdatedCaches();
precacheAndRoute((sw.__WB_MANIFEST || []).filter((e: any) => !String(typeof e === "string" ? e : e.url).endsWith(".html")));
registerRoute(new NavigationRoute(new NetworkFirst({ cacheName: "pages", networkTimeoutSeconds: 5 }), { denylist: [/^\/~oauth/, /^\/share-target/] }));
