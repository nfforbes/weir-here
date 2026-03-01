import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { IJob } from '@weir-here/shared';
import { api } from '../../services/api';

interface JobsState {
  jobs: IJob[];
  currentJob: IJob | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  searchQuery: '',
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params?: Record<string, string>) => {
    return api.get<IJob[]>('/api/jobs', params);
  },
);

export const fetchJob = createAsyncThunk('jobs/fetchJob', async (id: string) => {
  return api.get<IJob>(`/api/jobs/${id}`);
});

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (data: Omit<IJob, '_id' | 'postedBy' | 'createdAt' | 'updatedAt' | 'attachmentPaths'>) => {
    return api.post<IJob>('/api/jobs', data);
  },
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearCurrentJob(state) {
      state.currentJob = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<IJob[]>) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load jobs';
      })
      .addCase(fetchJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJob.fulfilled, (state, action: PayloadAction<IJob>) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load job';
      })
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action: PayloadAction<IJob>) => {
        state.loading = false;
        state.jobs = [action.payload, ...state.jobs];
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to create job';
      });
  },
});

export const { setSearchQuery, clearCurrentJob, clearError } = jobsSlice.actions;
export default jobsSlice.reducer;
