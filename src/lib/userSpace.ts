import { supabase } from "@/integrations/supabase/client";
import { getFileSecurityIssue } from "@/utils/fileTransfer.utils";

import { USER_SPACE_QUOTA_BYTES } from "@/lib/quota";
export { USER_SPACE_QUOTA_BYTES };

export interface UserFile {
  id: string;
  owner_id: string;
  storage_path: string;
  file_name: string;
  file_type: string | null;
  file_size: number;
  created_at: string;
}

export const remainingQuota = (usedBytes: number) => Math.max(0, USER_SPACE_QUOTA_BYTES - usedBytes);

const safeKey = (name: string) => {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const id = crypto.randomUUID();
  return ext ? `${id}.${ext}` : id;
};

export async function listUserFiles(): Promise<UserFile[]> {
  const { data, error } = await supabase.from("user_files").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserFile[];
}

export async function saveToUserSpace(ownerId: string, file: File) {
  const issue = getFileSecurityIssue(file);
  if (issue) throw new Error(`${issue}: ${file.name}`);
  const path = `${ownerId}/${safeKey(file.name)}`;
  const { error: upErr } = await supabase.storage.from("user-space").upload(path, file, { upsert: false });
  if (upErr) throw new Error(`Upload failed for ${file.name}: ${upErr.message}`);
  const { error } = await supabase.from("user_files").insert({
    owner_id: ownerId, storage_path: path, file_name: file.name,
    file_type: file.type || "application/octet-stream", file_size: file.size,
  });
  if (error) {
    await supabase.storage.from("user-space").remove([path]);
    throw new Error(error.message.includes("limit") ? "Your 2 GB space is full." : error.message);
  }
}

export async function deleteUserFile(f: UserFile) {
  await supabase.storage.from("user-space").remove([f.storage_path]);
  const { error } = await supabase.from("user_files").delete().eq("id", f.id);
  if (error) throw error;
}

export async function getUserFileBlob(f: UserFile) {
  const { data, error } = await supabase.storage.from("user-space").download(f.storage_path);
  if (error || !data) throw new Error(`Could not open ${f.file_name}`);
  return new File([data], f.file_name, { type: f.file_type || data.type });
}

/** Sends a file from the user's space into the SRGEC queue. The user's own copy stays. */
export async function sendUserFileToReceiver(f: UserFile, senderName: string) {
  const file = await getUserFileBlob(f);
  const id = crypto.randomUUID();
  const path = `${id}/${safeKey(f.file_name)}`;
  const { error: upErr } = await supabase.storage.from("pending-files").upload(path, file, { upsert: false });
  if (upErr) throw new Error(`Failed to send ${f.file_name}: ${upErr.message}`);
  const { error } = await supabase.from("pending_transfers").insert({
    sender_name: senderName.trim(), file_name: f.file_name, file_type: f.file_type || "application/octet-stream",
    file_size: f.file_size, storage_path: path, owner_id: f.owner_id, source_file_id: f.id,
  });
  if (error) {
    await supabase.storage.from("pending-files").remove([path]);
    throw new Error(error.message);
  }
  void import("@/lib/analytics").then(m => m.trackTransferUploaded({
    sender_name: senderName.trim(), file_name: f.file_name, file_size: f.file_size, file_type: f.file_type || "application/octet-stream",
  }));
}

export const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  const u = ["KB", "MB", "GB"]; let v = b / 1024, i = 0;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${u[i]}`;
};
