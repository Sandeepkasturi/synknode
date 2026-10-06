import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, File, X, Send, User, Plus, Building2, ShieldCheck, LockKeyhole, CheckCircle2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useSenderPeer } from "@/hooks/useSenderPeer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { validateFiles, registerUserForHour } from "@/utils/fileTransfer.utils";
import { SenderFeedbackCampaign } from "@/components/feedback/SenderFeedbackCampaign";

export const SenderForm: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [name, setName] = useState<string>(() => localStorage.getItem('sender_name') || '');
  const [checkingName, setCheckingName] = useState(false);
  const [completedTransfers, setCompletedTransfers] = useState(0);
  const { sendFiles, transferProgress } = useSenderPeer();
  const [receipt, setReceipt] = useState<{ files: File[]; date: Date } | null>(null);
  useEffect(() => {
    if (transferProgress.status !== 'completed') return;
    setReceipt({ files: selectedFiles, date: new Date() });
    setSelectedFiles([]);
    setCompletedTransfers(count => count + 1);
  }, [transferProgress.status]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = await validateFiles(acceptedFiles);
    if (validFiles.length === 0) return;

    setSelectedFiles(prev => {
      const seen = new Set(prev.map(f => `${f.name}|${f.size}|${f.lastModified}`));
      const fresh = validFiles.filter(f => !seen.has(`${f.name}|${f.size}|${f.lastModified}`));
      const skipped = validFiles.length - fresh.length;

      if (fresh.length > 0) toast.success(`${fresh.length} file(s) added`);
      if (skipped > 0) toast.info(`${skipped} file(s) already in your list`);

      return [...prev, ...fresh];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Returns true when the name is free (or already owned by this device)
  const isUsernameAvailable = async (candidate: string) => {
    const ownName = localStorage.getItem('sender_name');
    if (ownName && ownName.toLowerCase() === candidate.toLowerCase()) return true;

    const { data, error } = await supabase
      .from('pending_transfers')
      .select('sender_name')
      .ilike('sender_name', candidate)
      .eq('downloaded', false)
      .limit(1);

    if (error) return true; // don't block on lookup failure
    if (data && data.length > 0) {
      const suggestion = `${candidate}_${Math.floor(Math.random() * 90 + 10)}`;
      toast.error(`Username "${candidate}" already exists`, {
        description: `Someone is already in the queue with this name. Try something different — for example "${suggestion}".`
      });
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select files to send");
      return;
    }

    setCheckingName(true);
    const available = await isUsernameAvailable(name.trim());
    setCheckingName(false);
    if (!available) return;

    if (!registerUserForHour(name.trim())) {
      return;
    }

    localStorage.setItem('sender_name', name.trim());

    try {
      await sendFiles(selectedFiles, name);

    } catch (error) {
      console.error('Send failed:', error);
    }
  };


  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

  const busy = transferProgress.active && transferProgress.status !== 'completed';
  const safety = <div className="transfer-safety"><span><LockKeyhole />Encrypted in transit</span><span><ShieldCheck />File safety checks</span><span><CheckCircle2 />No account required</span></div>;

  return <div className="sender-form">
    <SenderFeedbackCampaign completedTransfers={completedTransfers} />
    {busy ? <div className="upload-view">
      <h2 className="text-2xl font-bold">{transferProgress.status === 'connecting' ? 'Connecting…' : 'Uploading files…'}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Your files are being transferred to SRGEC.</p>
      <div className="mt-6 space-y-2">{selectedFiles.map(file => <div className="upload-file-row" key={file.name}><span className="file-type-icon"><File /></span><div className="min-w-0 flex-1"><p className="truncate text-sm">{file.name}</p><p className="mt-1 text-xs text-muted-foreground">{formatFileSize(file.size)}</p></div></div>)}</div>
      <div className="mt-5 flex items-center justify-between gap-4 text-xs"><span className="truncate text-muted-foreground">{transferProgress.currentFile || 'Preparing your transfer'}</span><span className="text-primary">{transferProgress.progress}%</span></div>
      <Progress value={transferProgress.progress} className="mt-2 h-2" />
      <div className="protection-panel"><ShieldCheck className="h-8 w-8 text-success" /><div><p className="font-semibold text-sm">Your files are protected</p><p className="mt-2 text-xs text-muted-foreground">Encrypted in transit · Risky file types filtered</p></div></div>
    </div> : receipt ? <div className="completion-view">
      <CheckCircle2 className="completion-icon" />
      <h2 className="mt-5 text-2xl font-bold text-success">Transfer complete!</h2><p className="mt-2 text-sm text-muted-foreground">Your files have been sent to SRGEC.</p>
      <div className="receipt-details"><div><p>Files</p><strong>{receipt.files.length} files · {formatFileSize(receipt.files.reduce((sum, f) => sum + f.size, 0))}</strong></div><div><p>Destination</p><strong>SRGEC</strong></div><div><p>Sent at</p><strong>{receipt.date.toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</strong></div></div>
      <div className="completion-actions"><Button onClick={() => setReceipt(null)} disabled={transferProgress.active}><Send />Send more files</Button><Button asChild variant="outline"><Link to="/?view=activity"><ListChecks />View in Activity</Link></Button></div>
    </div> : <>
      <div className="sender-fields">
        <div className="space-y-2"><label htmlFor="sender-name" className="field-label"><User />Your name</label><div className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="sender-name" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} className="pl-9 bg-secondary/40" disabled={busy} /></div><p className="text-[11px] text-muted-foreground">This name will be visible to the receiver.</p></div>
        <div className="space-y-2"><p className="field-label"><Building2 />Destination</p><div className="destination-panel"><Building2 className="h-7 w-7 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="text-sm font-bold">SRGEC</p><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">Seshadri Rao Gudlavalleru<br />Engineering College</p></div><span className="secure-badge"><ShieldCheck />Secure</span></div></div>
      </div>
      <div {...getRootProps()} className={`file-dropzone ${isDragActive ? 'is-dragging' : ''}`}>
        <input {...getInputProps()} aria-label="Select files" disabled={busy} />
        <CloudUpload className="mx-auto mb-3 h-9 w-9 text-primary" /><p className="text-sm font-semibold">Drop files here</p><p className="mt-1 text-xs text-muted-foreground">or click to browse</p><p className="mt-3 text-[10px] text-muted-foreground">50 MB per file · Up to 5 GB total · Multiple files allowed</p>
      </div>
      {selectedFiles.length > 0 && <>
        <div className="selected-summary"><span>{selectedFiles.length} files selected</span><Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])} className="text-primary">Clear all</Button></div>
        <div className="selected-file-grid"><AnimatePresence>{selectedFiles.map((file, index) => <motion.div key={`${file.name}-${file.lastModified}`} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="selected-file"><span className="file-type-icon"><File /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{file.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p></div><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`} title="Remove file"><X /></Button></motion.div>)}</AnimatePresence></div>
      </>}
      <div className="send-action-row"><div>{selectedFiles.length > 0 ? <><p className="text-xs text-muted-foreground">{selectedFiles.length} files · {formatFileSize(totalSize)}</p><Button variant="ghost" size="sm" onClick={open} className="mt-1 h-7 px-0 text-primary"><Plus />Add more files</Button></> : null}</div><Button onClick={handleSend} disabled={selectedFiles.length === 0 || !name.trim() || checkingName} className="send-action"><Send />{checkingName ? 'Checking name…' : selectedFiles.length ? `Send ${selectedFiles.length} files` : 'Send files'}</Button></div>
      {safety}
    </>}
  </div>;
};
