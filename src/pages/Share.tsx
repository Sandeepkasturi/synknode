import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { clearShareInbox, readShareInbox, setOutbox } from "@/lib/shareInbox";

export default function Share() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    readShareInbox().then(setFiles).catch(() => toast.error("Could not read shared files"));
  }, []);

  const continueToTransfer = async () => {
    if (!files.length) return;
    setOutbox(files);
    await clearShareInbox();
    navigate("/?view=transfer&source=share");
  };

  return <div className="app-shell min-h-screen bg-background"><Header /><main className="app-workspace">
    <section className="glass-card mx-auto max-w-xl p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Share to SynkNode</p>
      <h1 className="mt-3 text-3xl font-bold">Ready to send</h1>
      <p className="mt-2 text-sm text-muted-foreground">Files shared from your device are held locally until you choose a receiver.</p>
      <ul className="mt-6 flex flex-col gap-2">{files.map(file => <li key={`${file.name}-${file.lastModified}`} className="glass-card flex items-center justify-between p-3 text-sm"><span className="truncate">{file.name}</span><span className="text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB</span></li>)}</ul>
      {!files.length && <p className="mt-6 rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">No shared files are waiting.</p>}
      <Button className="mt-6 w-full" onClick={continueToTransfer} disabled={!files.length}>Continue to transfer</Button>
    </section>
  </main></div>;
}
