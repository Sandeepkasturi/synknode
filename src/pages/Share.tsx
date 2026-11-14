import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { formatBytes, saveToUserSpace } from "@/lib/userSpace";
import { addIncomingShare, associateIncomingShares, IncomingShare, readIncomingShares, removeIncomingItem, updateIncomingItem } from "@/lib/shareInbox";
import { getFileSecurityIssue } from "@/utils/fileTransfer.utils";
import { partitionSharedFiles } from "@/lib/shareIntake";
import { useSenderPeer } from "@/hooks/useSenderPeer";

const fileIcon = (type: string) => type.startsWith("image/") ? <ImageIcon className="text-primary" aria-hidden="true" /> : <FileText className="text-primary" aria-hidden="true" />;

export default function Share() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const { sendFiles, transferProgress } = useSenderPeer();
  const [shares, setShares] = useState<IncomingShare[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [senderName, setSenderName] = useState(() => localStorage.getItem("sender_name") || "");
  const intakeError = searchParams.get("error");
  const rejectedCount = Number(searchParams.get("rejected") || 0);

  const refresh = useCallback(async () => setShares(await readIncomingShares()), []);
  useEffect(() => { refresh().catch(() => toast.error("Could not read incoming shares")); }, [refresh]);
  useEffect(() => { if (user) associateIncomingShares(user.id).then(refresh); }, [user, refresh]);

  const pending = useMemo(() => shares.flatMap(share => share.items.filter(item => item.status !== "uploaded").map(item => ({ share, item }))), [shares]);
  const selectedPending = useMemo(() => pending.filter(({ item }) => selected.has(item.id)), [pending, selected]);

  const uploadToMySpace = async (ids?: Set<string>) => {
    if (!user) { toast.message("Sign in to save files to My Space"); navigate("/"); return; }
    const targets = pending.filter(({ item }) => !ids || ids.has(item.id));
    setUploading(true);
    for (const { share, item } of targets) {
      try {
        await updateIncomingItem(share.id, item.id, { status: "uploading", error: undefined });
        await saveToUserSpace(user.id, new File([item.blob], item.name, { type: item.type, lastModified: item.lastModified }));
        await updateIncomingItem(share.id, item.id, { status: "uploaded" });
      } catch (error) { await updateIncomingItem(share.id, item.id, { status: "failed", error: error instanceof Error ? error.message : "Upload failed" }); }
    }
    await refresh(); setUploading(false); toast.success("Saved to My Space");
  };

  const sendToSRGEC = async (ids?: Set<string>) => {
    const name = senderName.trim();
    if (!name) { toast.error("Enter your name before sending to SRGEC"); return; }
    const targets = pending.filter(({ item }) => !ids || ids.has(item.id));
    if (!targets.length) return;
    const invalid = targets.find(({ item }) => getFileSecurityIssue({ name: item.name, type: item.type }));
    if (invalid) { toast.error(`This file type cannot be sent: ${invalid.item.name}`); return; }
    localStorage.setItem("sender_name", name);
    setUploading(true);
    const succeeded = await sendFiles(targets.map(({ item }) => new File([item.blob], item.name, { type: item.type, lastModified: item.lastModified })), name);
    if (succeeded) {
      await Promise.all(targets.map(({ share, item }) => updateIncomingItem(share.id, item.id, { status: "uploaded" })));
      await refresh();
    }
    setUploading(false);
  };

  const addFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const { accepted: files, rejected } = partitionSharedFiles(Array.from(event.target.files || []));
    if (rejected.length) toast.error(`${rejected.length} file(s) skipped: files must be non-empty, no larger than 50 MB each, and within the 50-file limit.`);
    const valid = files.filter(file => !getFileSecurityIssue(file));
    if (valid.length !== files.length) toast.error("One or more files were blocked by safety checks");
    if (valid.length) { await addIncomingShare({ items: valid.map(file => ({ id: crypto.randomUUID(), shareId: "", name: file.name, type: file.type || "application/octet-stream", size: file.size, lastModified: file.lastModified, blob: file, status: "pending" })) }); await refresh(); toast.success(`${valid.length} file${valid.length > 1 ? "s" : ""} added`); }
    event.target.value = "";
  };

  return <div className="app-shell min-h-screen bg-background"><Header /><main className="app-workspace"><section className="glass-card mx-auto max-w-2xl p-5 sm:p-7">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Incoming shares</p><h1 className="mt-2 text-3xl font-bold">{pending.length ? "Ready to send" : "Files received"}</h1><p className="mt-2 text-sm text-muted-foreground">Review files shared from your phone, then send them to SRGEC or save them privately.</p></div><UploadCloud className="text-primary" aria-hidden="true" /></div>
    {intakeError && <div role="alert" className="mt-5 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm"><p className="font-semibold">{intakeError === "storage" ? "Files could not be saved on this device." : intakeError === "empty" ? "No files came through with this share." : "No supported files came through with this share."}</p><p className="mt-1 text-muted-foreground">Use Add more files to choose them directly, then try sending again.</p></div>}
    {rejectedCount > 0 && <div role="status" className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">{rejectedCount} shared file{rejectedCount === 1 ? " was" : "s were"} skipped because it was empty, over 50 MB, or beyond the 50-file limit.</div>}
    {!isLoading && !user && pending.length > 0 && <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">You can send to SRGEC without an account. Sign in only when you want to save files to My Space.</div>}
    <div className="mt-6 flex flex-col gap-3">{pending.map(({ share, item }) => <article key={item.id} className="glass-card flex items-center gap-3 p-3"><input type="checkbox" checked={selected.has(item.id)} onChange={() => setSelected(current => { const next = new Set(current); next.has(item.id) ? next.delete(item.id) : next.add(item.id); return next; })} aria-label={`Select ${item.name}`} /><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">{fileIcon(item.type)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{formatBytes(item.size)} · {item.status === "failed" ? item.error : item.status}</p>{item.status === "uploading" && <Progress value={transferProgress.progress} className="mt-2 h-1.5" />}</div>{item.status === "uploading" ? <Loader2 className="animate-spin text-primary" aria-label="Uploading" /> : <Button variant="ghost" size="icon" aria-label={`Remove ${item.name}`} onClick={() => removeIncomingItem(share.id, item.id).then(refresh)}><Trash2 /></Button>}</article>)}</div>
    {!pending.length && !intakeError && <p className="mt-7 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No incoming shares are waiting. Share files to SynkNode from your phone, or add files below.</p>}
    <div className="mt-6 grid gap-2 sm:grid-cols-2"><Button variant="outline" asChild><label htmlFor="share-file-picker" className="cursor-pointer">Add more files<input id="share-file-picker" type="file" multiple className="sr-only" onChange={addFiles} /></label></Button><Button disabled={uploading || !pending.length} onClick={() => sendToSRGEC()}>{uploading ? "Sending…" : "Send all to SRGEC"}</Button><Button variant="outline" disabled={uploading || !selectedPending.length} onClick={() => sendToSRGEC(selected)}>{`Send selected (${selectedPending.length})`}</Button><Button variant="secondary" disabled={uploading || !user || !pending.length} onClick={() => uploadToMySpace()}>{user ? "Save all to My Space" : "Sign in to save privately"}</Button></div>
  </section></main></div>;
}

