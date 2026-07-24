import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "synknode_visitor_id";
const SESSION_KEY = "synknode_session_logged";

const getOrCreateVisitorId = (): string => {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
};

/** Log one visit per browser session. Safe to call on every App mount. */
export const trackVisit = async () => {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const visitor_id = getOrCreateVisitorId();
    await supabase.from("site_visits").insert({
      visitor_id,
      user_agent: navigator.userAgent.slice(0, 500),
    });
  } catch (e) {
    console.warn("trackVisit failed:", e);
  }
};

/** Log an uploaded transfer for cumulative stats. */
export const trackTransferUploaded = async (params: {
  sender_name: string;
  file_name: string;
  file_size: number;
  file_type?: string | null;
}) => {
  try {
    await supabase.from("transfer_events").insert({ ...params, status: "uploaded" });
  } catch (e) {
    console.warn("trackTransferUploaded failed:", e);
  }
};

/** Mark a transfer as downloaded (best-effort by name + size + sender). */
export const trackTransferDownloaded = async (params: {
  sender_name: string;
  file_name: string;
  file_size: number;
  file_type?: string | null;
}) => {
  try {
    await supabase.from("transfer_events").insert({ ...params, status: "downloaded" });
  } catch (e) {
    console.warn("trackTransferDownloaded failed:", e);
  }
};

/** Client-side fallback cleanup for stale pending transfers (>60h, undownloaded). */
export const runExpirationSweep = async () => {
  try {
    await supabase.rpc("expire_stale_transfers");
  } catch (e) {
    console.warn("expire_stale_transfers failed:", e);
  }
};
