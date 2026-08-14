import React, { useEffect, useRef, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  blob: Blob;
}

export const PdfViewer: React.FC<Props> = ({ blob }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the document once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const pdfjs: any = await import("pdfjs-dist");
        const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        const data = await blob.arrayBuffer();
        const doc = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;
        docRef.current = doc;
        setNumPages(doc.numPages);
        setPage(1);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Could not render this PDF");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      docRef.current?.destroy?.();
      docRef.current = null;
    };
  }, [blob]);

  // Render current page
  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      const doc = docRef.current;
      const container = containerRef.current;
      if (!doc || !container) return;
      try {
        const pdfPage = await doc.getPage(page);
        if (cancelled) return;
        const viewport = pdfPage.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = "100%";
        canvas.style.maxWidth = `${viewport.width}px`;
        canvas.style.height = "auto";
        canvas.className = "rounded-lg shadow-sm bg-white mx-auto block";
        ctx.scale(dpr, dpr);
        await pdfPage.render({ canvasContext: ctx, viewport }).promise;
        if (cancelled) return;
        container.replaceChildren(canvas);
      } catch (e) {
        console.error(e);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [page, scale, numPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (error) {
    return <p className="py-20 text-center text-sm text-muted-foreground">{error}</p>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/50 bg-secondary/20 sticky top-0 z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-30"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono text-muted-foreground">{page} / {numPages}</span>
          <button
            onClick={() => setPage(p => Math.min(numPages, p + 1))}
            disabled={page >= numPages}
            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-30"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setScale(s => Math.max(0.5, +(s - 0.2).toFixed(2)))} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary" title="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono text-muted-foreground w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, +(s + 0.2).toFixed(2)))} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary" title="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="p-4 bg-secondary/20 overflow-auto max-h-[65vh]" />
    </div>
  );
};
