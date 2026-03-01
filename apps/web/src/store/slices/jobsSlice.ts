import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IJob } from '@weir-here/shared';

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  tags: string[];
  page: number;
  limit: number;
}

interface JobsState {
  jobs: IJob[];
  currentJob: IJob | null;
  loading: boolean;
  error: string | null;
  searchFilters: SearchFilters;
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  searchFilters: {
    query: '',
    category: '',
    location: '',
    tags: [],
    page: 1,
    limit: 10,
  },
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    fetchJobs(state) {
      state.loading = true;
      state.error = null;
    },
    fetchJobsSuccess(state, action: PayloadAction<IJob[]>) {
      state.jobs = action.payload;
      state.loading = false;
    },
    fetchJobsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchJob(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    fetchJobSuccess(state, action: PayloadAction<IJob>) {
      state.currentJob = action.payload;
      state.loading = false;
    },
    fetchJobFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createJob(state, _action: PayloadAction<Partial<IJob>>) {
      state.loading = true;
      state.error = null;
    },
    createJobSuccess(state, action: PayloadAction<IJob>) {
      state.jobs.push(action.payload);
      state.loading = false;
    },
    createJobFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateJob(state, _action: PayloadAction<{ id: string; data: Partial<IJob> }>) {
      state.loading = true;
      state.error = null;
    },
    updateJobSuccess(state, action: PayloadAction<IJob>) {
      const index = state.jobs.findIndex((j) => j._id === action.payload._id);
      if (index !== -1) state.jobs[index] = action.payload;
      if (state.currentJob?._id === action.payload._id) {
        state.currentJob = action.payload;
      }
      state.loading = false;
    },
    updateJobFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setSearchFilters(state, action: PayloadAction<Partial<SearchFilters>>) {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    clearCurrentJob(state) {
      state.currentJob = null;
    },
  },
});

export const {
  fetchJobs,
  fetchJobsSuccess,
  fetchJobsFailure,
  fetchJob,
  fetchJobSuccess,
  fetchJobFailure,
  createJob,
  createJobSuccess,
  createJobFailure,
  updateJob,
  updateJobSuccess,
  updateJobFailure,
  setSearchFilters,
  clearCurrentJob,
} = jobsSlice.actions;

export type { SearchFilters, JobsState };
export default jobsSlice.reducer;
