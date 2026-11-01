import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { formatBytes, saveToUserSpace } from "@/lib/userSpace";
import { associateIncomingShares, IncomingShare, readIncomingShares, removeIncomingItem, updateIncomingItem } from "@/lib/shareInbox";

const fileIcon = (type: string) => type.startsWith("image/") ? <ImageIcon className="text-primary" aria-hidden="true" /> : <FileText className="text-primary" aria-hidden="true" />;

export default function Share() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [shares, setShares] = useState<IncomingShare[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => setShares(await readIncomingShares()), []);
  useEffect(() => { refresh().catch(() => toast.error("Could not read incoming shares")); }, [refresh]);
  useEffect(() => { if (user) associateIncomingShares(user.id).then(refresh); }, [user, refresh]);

  const pending = useMemo(() => shares.flatMap(share => share.items.filter(item => item.status !== "uploaded").map(item => ({ share, item }))), [shares]);

  const uploadItems = async (ids?: Set<string>) => {
    if (!user) { toast.message("Sign in to upload shared files", { description: "Your files are safely preserved on this device." }); navigate("/"); return; }
    const targets = pending.filter(({ item }) => !ids || ids.has(item.id));
    if (!targets.length) return;
    setUploading(true);
    for (const { share, item } of targets) {
      try {
        await updateIncomingItem(share.id, item.id, { status: "uploading", error: undefined });
        await saveToUserSpace(user.id, new File([item.blob], item.name, { type: item.type, lastModified: item.lastModified }));
        await updateIncomingItem(share.id, item.id, { status: "uploaded" });
      } catch (error) {
        await updateIncomingItem(share.id, item.id, { status: "failed", error: error instanceof Error ? error.message : "Upload failed" });
      }
    }
    await refresh();
    setUploading(false);
    toast.success("Share processing complete");
  };

  const remove = async (shareId: string, itemId: string) => { await removeIncomingItem(shareId, itemId); await refresh(); };

  return <div className="app-shell min-h-screen bg-background"><Header /><main className="app-workspace"><section className="glass-card mx-auto max-w-2xl p-5 sm:p-7">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Incoming shares</p><h1 className="mt-2 text-3xl font-bold">Ready to send</h1><p className="mt-2 text-sm text-muted-foreground">Files shared from another app stay on this device until you upload them.</p></div><UploadCloud className="text-primary" aria-hidden="true" /></div>
    {!isLoading && !user && pending.length > 0 && <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">Sign in from the home screen to upload these files. They will remain available here after authentication.</div>}
    <div className="mt-6 flex flex-col gap-3">{pending.map(({ share, item }) => <article key={item.id} className="glass-card flex items-center gap-3 p-3"><input type="checkbox" checked={selected.has(item.id)} onChange={() => setSelected(current => { const next = new Set(current); next.has(item.id) ? next.delete(item.id) : next.add(item.id); return next; })} aria-label={`Select ${item.name}`} /><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">{fileIcon(item.type)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{formatBytes(item.size)} · {item.status === "failed" ? item.error : item.status}</p></div>{item.status === "uploading" ? <Loader2 className="animate-spin text-primary" aria-label="Uploading" /> : <Button variant="ghost" size="icon" aria-label={`Remove ${item.name}`} onClick={() => remove(share.id, item.id)}><Trash2 /></Button>}</article>)}</div>
    {!pending.length && <p className="mt-7 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No incoming shares are waiting.</p>}
    <div className="mt-6 flex flex-col gap-2 sm:flex-row"><Button className="flex-1" disabled={uploading || !pending.length} onClick={() => uploadItems()}>{uploading ? "Uploading…" : "Upload all"}</Button><Button variant="outline" className="flex-1" disabled={uploading || !selected.size} onClick={() => uploadItems(selected)}>Upload selected ({selected.size})</Button></div>
  </section></main></div>;
}
