import { supabase } from "@/integrations/supabase/client";

export const TRANSFER_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;

export interface VisitorQuota {
  allowed: boolean;
  used_bytes: number;
  remaining_bytes: number;
  limit_bytes: number;
  requested_bytes: number;
  next_reset_at: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseQuota = (value: unknown): VisitorQuota => {
  if (!isRecord(value)) throw new Error("The quota service returned an invalid response.");
  const { allowed, used_bytes, remaining_bytes, limit_bytes, requested_bytes, next_reset_at } = value;
  if (
    typeof allowed !== "boolean" ||
    typeof used_bytes !== "number" ||
    typeof remaining_bytes !== "number" ||
    typeof limit_bytes !== "number" ||
    typeof requested_bytes !== "number" ||
    (next_reset_at !== null && typeof next_reset_at !== "string")
  ) {
    throw new Error("The quota service returned an invalid response.");
  }
  return { allowed, used_bytes, remaining_bytes, limit_bytes, requested_bytes, next_reset_at };
};

export async function getVisitorQuota(visitorId: string): Promise<VisitorQuota> {
  const { data, error } = await supabase.rpc("check_sender_daily_quota", {
    p_sender_name: visitorId,
    p_new_bytes: 0,
    p_daily_limit_gb: 5,
  });
  if (error) throw new Error("Could not check the transfer quota.");
  return parseQuota(data);
}

export async function ensureTransferQuota(visitorId: string, requestedBytes: number): Promise<VisitorQuota> {
  const { data, error } = await supabase.rpc("check_sender_daily_quota", {
    p_sender_name: visitorId,
    p_new_bytes: requestedBytes,
    p_daily_limit_gb: 5,
  });
  if (error) throw new Error("Could not verify your 5 GiB transfer allowance. Please retry shortly.");

  const quota = parseQuota(data);
  if (!quota.allowed) {
    if (quota.remaining_bytes <= 0) {
      const resetAt = quota.next_reset_at ? new Date(quota.next_reset_at) : null;
      const resetMessage = resetAt && !Number.isNaN(resetAt.getTime())
        ? ` Your next capacity release is ${resetAt.toLocaleString()}.`
        : " Capacity will return as earlier transfers age out.";
      throw new Error(`Your 5 GiB allowance is fully used.${resetMessage}`);
    }
    throw new Error(
      `This transfer would exceed your 5 GiB allowance. ${formatQuotaBytes(quota.remaining_bytes)} remain.`,
    );
  }
  return quota;
}

export const formatQuotaBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KiB", "MiB", "GiB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(value < 10 ? 2 : 1)} ${units[unitIndex]}`;
};
