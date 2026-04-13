import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { ScreeningResult } from "@/types";

interface ScreeningState {
  results: ScreeningResult[];
  current: ScreeningResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: ScreeningState = { results: [], current: null, loading: false, error: null };

export const runScreening = createAsyncThunk(
  "screening/run",
  async (payload: { jobId: string; shortlistSize: number; candidateIds?: string[] }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/screening/run", payload);
      return data as ScreeningResult;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || "Screening failed");
    }
  }
);

export const fetchResults = createAsyncThunk("screening/fetchAll", async () => {
  const { data } = await api.get("/screening");
  return data as ScreeningResult[];
});

export const fetchResult = createAsyncThunk("screening/fetchOne", async (id: string) => {
  const { data } = await api.get(`/screening/${id}`);
  return data as ScreeningResult;
});

const screeningSlice = createSlice({
  name: "screening",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(runScreening.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(runScreening.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
        s.results.unshift(a.payload);
      })
      .addCase(runScreening.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(fetchResults.fulfilled, (s, a) => { s.results = a.payload; })
      .addCase(fetchResult.fulfilled, (s, a) => { s.current = a.payload; });
  },
});

export default screeningSlice.reducer;
