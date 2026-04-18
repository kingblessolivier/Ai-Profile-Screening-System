import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type QueueItem = {
  id: string;
  jobId: string;
  jobTitle: string;
  status: "processing" | "complete" | "failed";
  resultId?: string;
  error?: string;
  startedAt: number;
};

interface ScreeningQueueState {
  items: QueueItem[];
  unread: string[]; // ids of complete/failed items not yet dismissed
}

const initialState: ScreeningQueueState = { items: [], unread: [] };

const queueSlice = createSlice({
  name: "screeningQueue",
  initialState,
  reducers: {
    enqueue(s, a: PayloadAction<Omit<QueueItem, "startedAt">>) {
      s.items = s.items.filter((i) => i.id !== a.payload.id);
      s.items.push({ ...a.payload, startedAt: Date.now() });
    },
    markComplete(s, a: PayloadAction<{ id: string; resultId: string }>) {
      const item = s.items.find((i) => i.id === a.payload.id);
      if (item) {
        item.status = "complete";
        item.resultId = a.payload.resultId;
        if (!s.unread.includes(a.payload.id)) s.unread.push(a.payload.id);
      }
    },
    markFailed(s, a: PayloadAction<{ id: string; error?: string }>) {
      const item = s.items.find((i) => i.id === a.payload.id);
      if (item) {
        item.status = "failed";
        item.error = a.payload.error ?? "Screening failed";
        if (!s.unread.includes(a.payload.id)) s.unread.push(a.payload.id);
      }
    },
    markRead(s, a: PayloadAction<string>) {
      s.unread = s.unread.filter((id) => id !== a.payload);
    },
    dismiss(s, a: PayloadAction<string>) {
      s.items = s.items.filter((i) => i.id !== a.payload);
      s.unread = s.unread.filter((id) => id !== a.payload);
    },
  },
});

export const { enqueue, markComplete, markFailed, markRead, dismiss } = queueSlice.actions;
export default queueSlice.reducer;
