import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, Trash2, Download, Send, Radio, LogOut, FileIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccount } from "@/context/AccountContext";
import { USER_SPACE_QUOTA_BYTES, fitsQuota } from "@/lib/quota";
import { UserFile, listUserFiles, saveToUserSpace, deleteUserFile, getUserFileBlob, sendUserFileToReceiver, formatBytes } from "@/lib/userSpace";
import { setOutbox } from "@/lib/shareInbox";

const MySpace: React.FC = () => {
  const { account, loading, signOut } = useAccount();
  const navigate = useNavigate();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [senderName, setSenderName] = useState(() => localStorage.getItem("sender_name") || "");
  const input = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try { setFiles(await listUserFiles()); } catch (e) { toast.error("Could not load your files"); }
  }, []);
  useEffect(() => { if (account) refresh(); }, [account, refresh]);

  if (loading) return null;
  if (!account) {
    return <div className="app-shell min-h-screen bg-background"><Header /><main className="app-workspace">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center">
        <h1 className="text-xl font-bold">My Space</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to keep files in your own private 2 GB space and send them anytime.</p>
        <Button asChild className="mt-4"><Link to="/auth?next=/space">Sign in</Link></Button>
      </div></main></div>;
  }

  const used = files.reduce((s, f) => s + f.file_size, 0);
  const chosen = files.filter(f => selected.has(f.id));

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    const arr = Array.from(list);
    if (!fitsQuota(used, arr.reduce((s, f) => s + f.size, 0))) { toast.error("Not enough space in your 2 GB storage."); return; }
    setBusy("upload");
    for (const f of arr) {
      try { await saveToUserSpace(account.id, f); } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
    }
    setBusy(null); refresh(); toast.success("Saved to My Space");
  };

  const toggle = (id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const sendToReceiver = async () => {
    if (!senderName.trim()) { toast.error("Enter your name first"); return; }
    localStorage.setItem("sender_name", senderName.trim());
    setBusy("send");
    try {
      for (const f of chosen) await sendUserFileToReceiver(f, senderName);
      toast.success(`Sent ${chosen.length} file(s) to SRGEC`);
      setSelected(new Set());
    } catch (e) { toast.error(e instanceof Error ? e.message : "Send failed"); }
    setBusy(null);
  };

  const sendToDevice = async () => {
    setBusy("device");
    try {
      setOutbox(await Promise.all(chosen.map(getUserFileBlob)));
      navigate("/direct?mode=send");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not prepare files"); setBusy(null); }
  };

  const download = async (f: UserFile) => {
    const file = await getUserFileBlob(f);
    const url = URL.createObjectURL(file);
    const a = document.createElement("a"); a.href = url; a.download = f.file_name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return <div className="app-shell min-h-screen bg-background"><Header /><main className="app-workspace">
    <div className="workspace-heading flex items-start justify-between gap-3">
      <div><h1>My Space</h1><p>{account.email}</p></div>
      <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4" />Sign out</Button>
    </div>
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex justify-between text-sm"><span>{formatBytes(used)} used</span><span className="text-muted-foreground">of {formatBytes(USER_SPACE_QUOTA_BYTES)}</span></div>
      <Progress className="mt-2" value={(used / USER_SPACE_QUOTA_BYTES) * 100} />
      <input ref={input} type="file" multiple hidden onChange={e => { upload(e.target.files); e.target.value = ""; }} />
      <Button className="mt-4 w-full" onClick={() => input.current?.click()} disabled={busy === "upload"}><Upload className="h-4 w-4" />{busy === "upload" ? "Uploading…" : "Add files"}</Button>
    </div>

    {chosen.length > 0 && <div className="mt-4 space-y-3 rounded-2xl border border-primary/40 bg-card p-4">
      <p className="text-sm font-semibold">{chosen.length} selected</p>
      <Input placeholder="Your name for SRGEC" value={senderName} onChange={e => setSenderName(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={sendToReceiver} disabled={!!busy}><Send className="h-4 w-4" />{busy === "send" ? "Sending…" : "Send to SRGEC"}</Button>
        <Button variant="secondary" onClick={sendToDevice} disabled={!!busy}><Radio className="h-4 w-4" />Send to device</Button>
      </div>
    </div>}

    <ul className="mt-4 space-y-2">
      {files.length === 0 && <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No files yet.</li>}
      {files.map(f => <li key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <Checkbox checked={selected.has(f.id)} onCheckedChange={() => toggle(f.id)} aria-label={`Select ${f.file_name}`} />
        <FileIcon className="h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{f.file_name}</p><p className="text-xs text-muted-foreground">{formatBytes(f.file_size)} · {new Date(f.created_at).toLocaleString()}</p></div>
        <Button size="icon" variant="ghost" onClick={() => download(f)} aria-label="Download"><Download className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" onClick={async () => { await deleteUserFile(f); refresh(); }} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
      </li>)}
    </ul>
  </main></div>;
};
export default MySpace;
