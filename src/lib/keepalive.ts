import { supabase } from "@/integrations/supabase/client";

/** Wait helper. */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Retry a promise-returning operation on transient network failures
 * ("Failed to fetch", timeouts, 5xx) with exponential backoff.
 * Terminal errors (validation, permissions, duplicates) are rethrown immediately.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { attempts = 4, baseDelay = 800 }: { attempts?: number; baseDelay?: number } = {},
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      const msg = String(e?.message ?? e ?? "").toLowerCase();
      const transient =
        msg.includes("failed to fetch") ||
        msg.includes("network") ||
        msg.includes("timeout") ||
        msg.includes("fetch failed") ||
        msg.includes("load failed") ||
        msg.includes("503") ||
        msg.includes("502") ||
        msg.includes("504");
      if (!transient || i === attempts - 1) throw e;
      // Backend may be cold-starting — nudge it and back off.
      void pingBackend();
      await wait(baseDelay * Math.pow(2, i));
    }
  }
  throw lastError;
}

/** Cheap read that wakes the backend if it is idle/cold. */
export async function pingBackend(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("pending_transfers")
      .select("id", { count: "exact", head: true })
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Make sure the backend answers before doing real work.
 * Retries a few times so a cold backend doesn't surface as "Failed to fetch".
 */
export async function ensureBackendAwake(attempts = 5): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    if (await pingBackend()) return true;
    await wait(1000 * Math.pow(1.8, i));
  }
  return false;
}

/** Keep the app-side connection warm (browser tab heartbeat). */
export function startKeepAlive(intervalMs = 10 * 60 * 1000) {
  void pingBackend();
  const iv = setInterval(() => {
    if (document.visibilityState === "visible") void pingBackend();
  }, intervalMs);
  const onVisible = () => {
    if (document.visibilityState === "visible") void pingBackend();
  };
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    clearInterval(iv);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
