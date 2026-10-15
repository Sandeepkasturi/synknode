// Single guarded registration point for the app service worker.
const isPreviewHost = (h: string) =>
  h.startsWith("id-preview--") || h.startsWith("preview--") ||
  h === "lovableproject.com" || h.endsWith(".lovableproject.com") ||
  h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com") ||
  h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev");

async function unregisterAppWorkers() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.filter(r => (r.active || r.installing || r.waiting)?.scriptURL.endsWith("/sw.js")).map(r => r.unregister()));
}

export function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  let inIframe = false;
  try { inIframe = window.self !== window.top; } catch { inIframe = true; }
  const off = new URLSearchParams(location.search).get("sw") === "off";
  if (!import.meta.env.PROD || inIframe || isPreviewHost(location.hostname) || off) {
    void unregisterAppWorkers();
    return;
  }
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(e => console.warn("SW registration failed", e));
  });
}
