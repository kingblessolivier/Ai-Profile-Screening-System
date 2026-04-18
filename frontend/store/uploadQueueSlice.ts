import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UploadItem = {
  id: string;
  jobId: string;
  jobTitle: string;
  fileCount: number;
  type: "pdf" | "csv";
  status: "processing" | "complete" | "failed";
  created?: number;
  updated?: number;
  failed?: number;
  error?: string;
  startedAt: number;
};

interface UploadQueueState {
  items: UploadItem[];
  unread: string[];
}

const initialState: UploadQueueState = { items: [], unread: [] };

const uploadQueueSlice = createSlice({
  name: "uploadQueue",
  initialState,
  reducers: {
    enqueueUpload(s, a: PayloadAction<Omit<UploadItem, "startedAt">>) {
      s.items.push({ ...a.payload, startedAt: Date.now() });
    },
    markUploadComplete(
      s,
      a: PayloadAction<{ id: string; created: number; updated: number; failed: number }>
    ) {
      const item = s.items.find((i) => i.id === a.payload.id);
      if (item) {
        item.status  = "complete";
        item.created = a.payload.created;
        item.updated = a.payload.updated;
        item.failed  = a.payload.failed;
        if (!s.unread.includes(a.payload.id)) s.unread.push(a.payload.id);
      }
    },
    markUploadFailed(s, a: PayloadAction<{ id: string; error?: string }>) {
      const item = s.items.find((i) => i.id === a.payload.id);
      if (item) {
        item.status = "failed";
        item.error  = a.payload.error ?? "Upload failed";
        if (!s.unread.includes(a.payload.id)) s.unread.push(a.payload.id);
      }
    },
    dismissUpload(s, a: PayloadAction<string>) {
      s.items  = s.items.filter((i) => i.id !== a.payload);
      s.unread = s.unread.filter((id) => id !== a.payload);
    },
  },
});

export const { enqueueUpload, markUploadComplete, markUploadFailed, dismissUpload } =
  uploadQueueSlice.actions;
export default uploadQueueSlice.reducer;
