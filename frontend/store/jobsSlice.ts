import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Job } from "@/types";

interface JobsState { items: Job[]; current: Job | null; loading: boolean; error: string | null; }

const initialState: JobsState = { items: [], current: null, loading: false, error: null };

export const fetchJobs = createAsyncThunk("jobs/fetchAll", async () => {
  const { data } = await api.get("/jobs");
  return data as Job[];
});

export const fetchJob = createAsyncThunk("jobs/fetchOne", async (id: string) => {
  const { data } = await api.get(`/jobs/${id}`);
  return data as Job;
});

export const createJob = createAsyncThunk("jobs/create", async (payload: Partial<Job>) => {
  const { data } = await api.post("/jobs", payload);
  return data as Job;
});

export const updateJob = createAsyncThunk(
  "jobs/update",
  async ({ id, payload }: { id: string; payload: Partial<Job> }) => {
    const { data } = await api.put(`/jobs/${id}`, payload);
    return data as Job;
  }
);

export const deleteJob = createAsyncThunk("jobs/delete", async (id: string) => {
  await api.delete(`/jobs/${id}`);
  return id;
});

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchJobs.pending, (s) => { s.loading = true; })
      .addCase(fetchJobs.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchJobs.rejected, (s, a) => { s.loading = false; s.error = String(a.error.message); })
      .addCase(fetchJob.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(createJob.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateJob.fulfilled, (s, a) => {
        const i = s.items.findIndex((j) => j._id === a.payload._id);
        if (i >= 0) s.items[i] = a.payload;
        s.current = a.payload;
      })
      .addCase(deleteJob.fulfilled, (s, a) => {
        s.items = s.items.filter((j) => j._id !== a.payload);
      });
  },
});

export default jobsSlice.reducer;
