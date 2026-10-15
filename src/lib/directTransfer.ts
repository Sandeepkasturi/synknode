import Peer, { DataConnection } from "peerjs";

const CHUNK = 64 * 1024;
const MAX_BUFFER = 8 * 1024 * 1024;
export const peerIdFor = (code: string) => `synknode-direct-${code.toUpperCase()}`;

export const makePairCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), b => chars[b % chars.length]).join("");
};

type Msg =
  | { t: "meta"; id: string; name: string; size: number; type: string }
  | { t: "chunk"; id: string; data: ArrayBuffer }
  | { t: "end"; id: string };

export interface IncomingProgress { id: string; name: string; size: number; received: number; file?: File }

/** Host side: waits for a device to connect and streams received files back via callback. */
export function hostDirect(code: string, onUpdate: (p: IncomingProgress) => void, onPeer: (connected: boolean) => void) {
  const peer = new Peer(peerIdFor(code));
  const parts = new Map<string, { meta: IncomingProgress; type: string; chunks: ArrayBuffer[] }>();
  peer.on("connection", (conn: DataConnection) => {
    conn.on("open", () => onPeer(true));
    conn.on("close", () => onPeer(false));
    conn.on("data", (raw) => {
      const m = raw as Msg;
      if (m.t === "meta") {
        const meta = { id: m.id, name: m.name, size: m.size, received: 0 };
        parts.set(m.id, { meta, type: m.type, chunks: [] });
        onUpdate({ ...meta });
      } else if (m.t === "chunk") {
        const p = parts.get(m.id); if (!p) return;
        p.chunks.push(m.data); p.meta.received += m.data.byteLength;
        onUpdate({ ...p.meta });
      } else if (m.t === "end") {
        const p = parts.get(m.id); if (!p) return;
        const file = new File(p.chunks, p.meta.name, { type: p.type });
        parts.delete(m.id); // nothing is kept once delivered
        onUpdate({ ...p.meta, received: p.meta.size, file });
      }
    });
  });
  return { peer, stop: () => peer.destroy() };
}

/** Sender side: connects to a host code and streams files with backpressure. */
export function sendDirect(code: string, files: File[], onProgress: (sent: number, total: number, name: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const peer = new Peer();
    const total = files.reduce((s, f) => s + f.size, 0);
    let sent = 0;
    const fail = (e: unknown) => { peer.destroy(); reject(e instanceof Error ? e : new Error(String(e))); };
    const timer = setTimeout(() => fail(new Error("Could not reach that device. Check the code and that it is open.")), 20000);
    peer.on("error", fail);
    peer.on("open", () => {
      const conn = peer.connect(peerIdFor(code), { reliable: true });
      conn.on("error", fail);
      conn.on("open", async () => {
        clearTimeout(timer);
        try {
          for (const f of files) {
            const id = crypto.randomUUID();
            conn.send({ t: "meta", id, name: f.name, size: f.size, type: f.type || "application/octet-stream" });
            for (let off = 0; off < f.size; off += CHUNK) {
              const dc = conn.dataChannel;
              while (dc && dc.bufferedAmount > MAX_BUFFER) await new Promise(r => setTimeout(r, 30));
              const data = await f.slice(off, off + CHUNK).arrayBuffer();
              conn.send({ t: "chunk", id, data });
              sent += data.byteLength;
              onProgress(sent, total, f.name);
            }
            conn.send({ t: "end", id });
          }
          const dc = conn.dataChannel;
          while (dc && dc.bufferedAmount > 0) await new Promise(r => setTimeout(r, 50));
          setTimeout(() => { peer.destroy(); resolve(); }, 500);
        } catch (e) { fail(e); }
      });
    });
  });
}
