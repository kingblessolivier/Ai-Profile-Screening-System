import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Candidate } from "@/types";

interface CandidatesState {
  items: Candidate[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: CandidatesState = { items: [], total: 0, loading: false, error: null };

export const fetchCandidates = createAsyncThunk(
  "candidates/fetchAll",
  async (params?: { source?: string; search?: string; page?: number }) => {
    const { data } = await api.get("/candidates", { params });
    return data as { candidates: Candidate[]; total: number };
  }
);

export const seedDummyData = createAsyncThunk(
  "candidates/seed",
  async (candidates: Omit<Candidate, "_id">[]) => {
    const { data } = await api.post("/candidates/bulk", { candidates });
    return data;
  }
);

export const deleteCandidate = createAsyncThunk("candidates/delete", async (id: string) => {
  await api.delete(`/candidates/${id}`);
  return id;
});

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCandidates.pending, (s) => { s.loading = true; })
      .addCase(fetchCandidates.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.candidates;
        s.total = a.payload.total;
      })
      .addCase(fetchCandidates.rejected, (s, a) => {
        s.loading = false;
        s.error = String(a.error.message);
      })
      .addCase(deleteCandidate.fulfilled, (s, a) => {
        s.items = s.items.filter((c) => c._id !== a.payload);
        s.total -= 1;
      });
  },
});

export default candidatesSlice.reducer;
