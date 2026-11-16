import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getFileSecurityIssue } from "@/utils/fileTransfer.utils";
import { sendTransferEvent, sendFailedTransferEvent } from "@/lib/servicenow";
import { withRetry, ensureBackendAwake } from "@/lib/keepalive";
import { validateTransferBatch } from "@/lib/transferLimits";
import { ensureTransferQuota } from "@/lib/transferQuota";
import { getOrCreateVisitorId } from "@/lib/analytics";
import { HighSpeedUploadQueue, uploadWithProgress, type BatchProgress, type FileUploadProgress } from "@/lib/uploadEngine";

interface TransferProgress {
  active: boolean;
  progress: number;
  status: "idle" | "connecting" | "transferring" | "completed" | "error";
  currentFile?: string;
  items: FileUploadProgress[];
  batch?: BatchProgress;
}

export const useSenderPeer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [senderName, setSenderName] = useState<string>(() => localStorage.getItem("sender_name") || "");
  const [transferProgress, setTransferProgress] = useState<TransferProgress>({
    active: false,
    progress: 0,
    status: "idle",
    items: [],
  });
  const queueRef = useRef<HighSpeedUploadQueue | null>(null);

  const updateSenderName = useCallback((name: string) => {
    setSenderName(name);
    localStorage.setItem("sender_name", name);
  }, []);

  const sendFiles = useCallback(async (files: File[], name: string) => {
    if (!name.trim()) {
      toast.error("Please enter your name first");
      return false;
    }

    const validation = validateTransferBatch(files);
    if (!validation.valid) {
      validation.errors.forEach((message) => toast.error(message));
      return false;
    }

    updateSenderName(name);
    setIsConnected(true);
    setTransferProgress({ active: true, progress: 0, status: "connecting", items: [] });

    try {
      const awake = await ensureBackendAwake();
      if (!awake) throw new Error("Backend is waking up. Please retry in a few seconds.");

      await ensureTransferQuota(getOrCreateVisitorId(), validation.totalBytes);

      const queue = new HighSpeedUploadQueue((items, batch) => {
        const values = [...items.values()];
        const activeFile = values.find((item) => item.status === "uploading");
        setTransferProgress((current) => ({
          ...current,
          active: true,
          status: "transferring",
          progress: batch.aggregatePercent,
          currentFile: activeFile?.fileName,
          items: values,
          batch,
        }));
      }, 4);
      queueRef.current = queue;

      await queue.uploadBatch(files, async (file, fileId, onBytes, track) => {
        const fileStartTime = Date.now();
        const extension = file.name.split(".").pop() || "";
        try {
          const securityIssue = getFileSecurityIssue(file);
          if (securityIssue) throw new Error(`${securityIssue}: ${file.name}`);

          const { data: existing } = await supabase
            .from("pending_transfers")
            .select("id")
            .eq("sender_name", name.trim())
            .eq("file_name", file.name)
            .eq("file_size", file.size)
            .eq("downloaded", false)
            .maybeSingle();

          if (existing) return;

          const storageExtension = file.name.includes(".")
            ? file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase().replace(/[^a-z0-9]/g, "")
            : "";
          const storagePath = `${fileId}/${storageExtension ? `${fileId}.${storageExtension}` : fileId}`;
          const { data: signed, error: signedError } = await supabase.storage
            .from("pending-files")
            .createSignedUploadUrl(storagePath, { upsert: false });
          if (signedError || !signed?.signedUrl) throw new Error(`Could not prepare ${file.name} for upload: ${signedError?.message || "No upload URL returned"}`);

          const storageUrl = import.meta.env.VITE_SUPABASE_URL as string;
          const uploadUrl = signed.signedUrl.startsWith("http")
            ? signed.signedUrl
            : new URL(`/storage/v1${signed.signedUrl}`, storageUrl).toString();
          await uploadWithProgress(uploadUrl, file, onBytes, track);

          const { error: insertError } = await withRetry(async () => await supabase
            .from("pending_transfers")
            .insert({
              sender_name: name.trim(),
              file_name: file.name,
              file_type: file.type || "application/octet-stream",
              file_size: file.size,
              storage_path: storagePath,
            }));

          if (insertError) {
            await supabase.storage.from("pending-files").remove([storagePath]);
            throw new Error(`Failed to register ${file.name}: ${insertError.message}`);
          }

          await import("@/lib/analytics").then((module) => module.trackTransferUploaded({
            sender_name: name.trim(),
            file_name: file.name,
            file_size: file.size,
            file_type: file.type || "application/octet-stream",
          }));
          sendTransferEvent({
            sender_id: name.trim(),
            receiver_id: "SRGEC",
            file: { name: file.name, type: file.type || "application/octet-stream", size_bytes: file.size, extension },
            transfer: { duration_ms: Date.now() - fileStartTime, bytes_transferred: file.size },
          });
        } catch (error) {
          sendFailedTransferEvent({
            sender_id: name.trim(),
            receiver_id: "SRGEC",
            file: { name: file.name, type: file.type || "application/octet-stream", size_bytes: file.size, extension },
            transfer: { duration_ms: Date.now() - fileStartTime, bytes_transferred: 0, status: "failed" },
          }, error);
          throw error;
        }
      });

      setTransferProgress((current) => ({ ...current, active: true, progress: 100, status: "completed" }));
      toast.success("Files processed successfully!");
      setTimeout(() => {
        setTransferProgress({ active: false, progress: 0, status: "idle", items: [] });
        setIsConnected(false);
        queueRef.current = null;
      }, 3000);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error during file transfer");
      setTransferProgress((current) => ({ ...current, active: false, status: "error" }));
      setIsConnected(false);
      queueRef.current = null;
      return false;
    }
  }, [updateSenderName]);

  const cancelTransfer = useCallback(() => {
    queueRef.current?.abortAll();
    setTransferProgress((current) => ({ ...current, active: false, status: "error" }));
    setIsConnected(false);
    toast.info("Upload canceled");
  }, []);

  return { isConnected, senderName, updateSenderName, sendFiles, transferProgress, cancelTransfer };
};
