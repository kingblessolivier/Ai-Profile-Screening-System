/**
 * Module-level SSE singleton.
 * Persists across React component mount/unmount cycles so screenings
 * continue running in the background when the modal is minimized.
 */

const API_BASE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  "http://localhost:5000/api";

const connections   = new Map<string, EventSource>();
const thinkingStore = new Map<string, string>();
const textSubs      = new Map<string, Set<(text: string) => void>>();
const doneSubs      = new Map<string, Set<() => void>>();

function token(): string {
  return typeof window !== "undefined"
    ? (localStorage.getItem("talentai_token") ?? "")
    : "";
}

function notifyText(id: string, text: string) {
  textSubs.get(id)?.forEach((cb) => cb(text));
}

function notifyDone(id: string) {
  doneSubs.get(id)?.forEach((cb) => cb());
  doneSubs.delete(id);
  textSubs.delete(id);
}

async function dispatchComplete(screeningId: string) {
  try {
    const { store }        = await import("@/store");
    const { fetchResult }  = await import("@/store/screeningSlice");
    const { markComplete } = await import("@/store/screeningQueueSlice");
    const result = await store.dispatch(fetchResult(screeningId)).unwrap();
    store.dispatch(markComplete({ id: screeningId, resultId: result._id }));
  } catch {
    const { store }      = await import("@/store");
    const { markFailed } = await import("@/store/screeningQueueSlice");
    store.dispatch(markFailed({ id: screeningId, error: "Failed to retrieve results" }));
  }
}

async function dispatchFailed(screeningId: string, error?: string) {
  const { store }      = await import("@/store");
  const { markFailed } = await import("@/store/screeningQueueSlice");
  store.dispatch(markFailed({ id: screeningId, error: error ?? "Connection lost" }));
}

export function startStream(screeningId: string): void {
  if (typeof window === "undefined") return;
  if (connections.has(screeningId)) return;

  const url = `${API_BASE}/screening/${screeningId}/thinking-stream?token=${token()}`;
  const es  = new EventSource(url);
  connections.set(screeningId, es);
  if (!thinkingStore.has(screeningId)) thinkingStore.set(screeningId, "");

  es.onmessage = async (e: MessageEvent) => {
    try {
      const msg = JSON.parse(e.data as string) as { type: string; text?: string };
      if (msg.type === "chunk" && msg.text) {
        const next = (thinkingStore.get(screeningId) ?? "") + msg.text;
        thinkingStore.set(screeningId, next);
        notifyText(screeningId, next);
      } else if (msg.type === "done") {
        es.close();
        connections.delete(screeningId);
        await dispatchComplete(screeningId);
        notifyDone(screeningId);
      }
    } catch { /* ignore parse errors */ }
  };

  es.onerror = async () => {
    es.close();
    connections.delete(screeningId);
    await dispatchFailed(screeningId);
    notifyDone(screeningId);
  };
}

export function stopStream(screeningId: string): void {
  connections.get(screeningId)?.close();
  connections.delete(screeningId);
  thinkingStore.delete(screeningId);
  textSubs.delete(screeningId);
  doneSubs.delete(screeningId);
}

export function getThinking(screeningId: string): string {
  return thinkingStore.get(screeningId) ?? "";
}

export function isStreaming(screeningId: string): boolean {
  return connections.has(screeningId);
}

export function subscribeText(
  screeningId: string,
  cb: (text: string) => void
): () => void {
  if (!textSubs.has(screeningId)) textSubs.set(screeningId, new Set());
  textSubs.get(screeningId)!.add(cb);
  return () => textSubs.get(screeningId)?.delete(cb);
}

export function subscribeDone(screeningId: string, cb: () => void): () => void {
  if (!doneSubs.has(screeningId)) doneSubs.set(screeningId, new Set());
  doneSubs.get(screeningId)!.add(cb);
  return () => doneSubs.get(screeningId)?.delete(cb);
}
