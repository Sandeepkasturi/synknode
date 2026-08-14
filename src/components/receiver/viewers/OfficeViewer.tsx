import React, { useEffect, useState } from "react";
import { Loader2, FileIcon } from "lucide-react";

interface Props {
  blob: Blob;
  kind: "docx" | "sheet";
  fileName: string;
}

export const OfficeViewer: React.FC<Props> = ({ blob, kind, fileName }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [sheets, setSheets] = useState<{ name: string; html: string }[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setHtml(null);
      setSheets([]);
      try {
        const buffer = await blob.arrayBuffer();
        if (kind === "docx") {
          const mammoth: any = await import("mammoth/mammoth.browser");
          const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
          if (cancelled) return;
          setHtml(result.value || "<p>(empty document)</p>");
        } else {
          const XLSX: any = await import("xlsx");
          const wb = XLSX.read(buffer, { type: "array" });
          const parsed = wb.SheetNames.map((name: string) => ({
            name,
            html: XLSX.utils.sheet_to_html(wb.Sheets[name], { header: "", footer: "" }),
          }));
          if (cancelled) return;
          setSheets(parsed);
          setActive(0);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("This document could not be rendered in the browser");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [blob, kind]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-muted-foreground">
        <FileIcon className="h-12 w-12 mb-3 text-primary/60" />
        <p className="text-sm font-medium text-foreground mb-1">Preview unavailable</p>
        <p className="text-xs max-w-md">{error} — download {fileName} to open it in an office app.</p>
      </div>
    );
  }

  if (kind === "docx") {
    return (
      <div className="bg-secondary/20 p-4 overflow-auto max-h-[65vh]">
        <article
          className="mx-auto max-w-3xl bg-background text-foreground rounded-lg shadow-sm p-6 prose-preview"
          dangerouslySetInnerHTML={{ __html: html || "" }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {sheets.length > 1 && (
        <div className="flex gap-1 px-3 py-2 border-b border-border/50 bg-secondary/20 overflow-x-auto">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActive(i)}
              className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                i === active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-primary/10"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div
        className="p-4 overflow-auto max-h-[65vh] bg-secondary/20 sheet-preview"
        dangerouslySetInnerHTML={{ __html: sheets[active]?.html || "" }}
      />
    </div>
  );
};
