export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  fileSize: number;
  uploadedBytes: number;
  progressPercent: number;
  speedBytesPerSec: number;
  etaSeconds: number;
  status: "queued" | "uploading" | "verifying" | "completed" | "error";
  errorMessage?: string;
}

export interface BatchProgress {
  totalBytes: number;
  uploadedBytes: number;
  aggregatePercent: number;
  averageSpeedBytesPerSec: number;
  estimatedRemainingSeconds: number;
  activeCount: number;
  completedCount: number;
}

export class HighSpeedUploadQueue {
  private readonly concurrency: number;
  private readonly progressMap = new Map<string, FileUploadProgress>();
  private readonly requests = new Map<string, XMLHttpRequest>();

  constructor(
    private readonly onProgress: (items: Map<string, FileUploadProgress>, batch: BatchProgress) => void,
    concurrency = 4,
  ) {
    this.concurrency = Math.max(1, Math.floor(concurrency));
  }

  async uploadBatch(
    files: File[],
    upload: (file: File, fileId: string, onBytes: (loaded: number, speed: number, eta: number) => void, track: (xhr: XMLHttpRequest) => void) => Promise<void>,
  ): Promise<void> {
    const queue = files.map((file) => ({ file, id: crypto.randomUUID() }));
    for (const { file, id } of queue) {
      this.progressMap.set(id, {
        fileId: id,
        fileName: file.name,
        fileSize: file.size,
        uploadedBytes: 0,
        progressPercent: 0,
        speedBytesPerSec: 0,
        etaSeconds: 0,
        status: "queued",
      });
    }
    this.notify();

    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < queue.length) {
        const item = queue[nextIndex++];
        const current = this.progressMap.get(item.id)!;
        current.status = "uploading";
        this.notify();
        try {
          await upload(item.file, item.id, (loaded, speed, eta) => {
            current.uploadedBytes = loaded;
            current.progressPercent = item.file.size ? Math.min(99, Math.floor((loaded / item.file.size) * 100)) : 0;
            current.speedBytesPerSec = speed;
            current.etaSeconds = eta;
            this.notify();
          }, (xhr) => this.requests.set(item.id, xhr));
          current.uploadedBytes = item.file.size;
          current.progressPercent = 100;
          current.status = "completed";
        } catch (error) {
          current.status = "error";
          current.errorMessage = error instanceof Error ? error.message : "Transfer error";
        } finally {
          this.requests.delete(item.id);
          this.notify();
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(this.concurrency, queue.length) }, worker));
    if ([...this.progressMap.values()].some((item) => item.status === "error")) {
      throw new Error("One or more files failed to upload.");
    }
  }

  abortAll(): void {
    for (const xhr of this.requests.values()) xhr.abort();
    this.requests.clear();
  }

  private notify(): void {
    let totalBytes = 0;
    let uploadedBytes = 0;
    let totalSpeed = 0;
    let activeCount = 0;
    let completedCount = 0;

    for (const item of this.progressMap.values()) {
      totalBytes += item.fileSize;
      uploadedBytes += item.uploadedBytes;
      if (item.status === "uploading") {
        totalSpeed += item.speedBytesPerSec;
        activeCount++;
      }
      if (item.status === "completed") completedCount++;
    }

    const remaining = Math.max(0, totalBytes - uploadedBytes);
    this.onProgress(new Map(this.progressMap), {
      totalBytes,
      uploadedBytes,
      aggregatePercent: totalBytes ? Math.min(100, Math.floor((uploadedBytes / totalBytes) * 100)) : 0,
      averageSpeedBytesPerSec: totalSpeed,
      estimatedRemainingSeconds: totalSpeed ? Math.ceil(remaining / totalSpeed) : 0,
      activeCount,
      completedCount,
    });
  }
}

export function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (loaded: number, speedBytesPerSec: number, etaSeconds: number) => void,
  track: (xhr: XMLHttpRequest) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    track(xhr);
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");

    let lastTime = performance.now();
    let lastLoaded = 0;
    let emaSpeed = 0;
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const now = performance.now();
      const deltaSeconds = (now - lastTime) / 1000;
      if (deltaSeconds < 0.25) return;
      const instantSpeed = (event.loaded - lastLoaded) / deltaSeconds;
      emaSpeed = emaSpeed === 0 ? instantSpeed : 0.7 * emaSpeed + 0.3 * instantSpeed;
      lastTime = now;
      lastLoaded = event.loaded;
      onProgress(event.loaded, emaSpeed, emaSpeed > 0 ? Math.ceil((event.total - event.loaded) / emaSpeed) : 0);
    };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300
      ? resolve()
      : reject(new Error(`Upload failed with HTTP status ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload aborted"));
    xhr.send(file);
  });
}
