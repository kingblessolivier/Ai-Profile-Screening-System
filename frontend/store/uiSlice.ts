import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  jobModals: {
    addJob: boolean;
    uploadCandidates: boolean;
    screening: boolean;
    editJob: boolean;
  };
}

const initialState: UIState = {
  jobModals: {
    addJob: false,
    uploadCandidates: false,
    screening: false,
    editJob: false,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleJobModal: (
      state,
      action: PayloadAction<keyof UIState["jobModals"]>
    ) => {
      state.jobModals[action.payload] = !state.jobModals[action.payload];
    },
    openJobModal: (state, action: PayloadAction<keyof UIState["jobModals"]>) => {
      state.jobModals[action.payload] = true;
    },
    closeJobModal: (state, action: PayloadAction<keyof UIState["jobModals"]>) => {
      state.jobModals[action.payload] = false;
    },
    closeAllJobModals: (state) => {
      state.jobModals = {
        addJob: false,
        uploadCandidates: false,
        screening: false,
        editJob: false,
      };
    },
  },
});

export const { toggleJobModal, openJobModal, closeJobModal, closeAllJobModals } =
  uiSlice.actions;
export default uiSlice.reducer;
