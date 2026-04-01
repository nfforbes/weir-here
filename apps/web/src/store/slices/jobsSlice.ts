import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IJob } from '@weir-here/shared';
import { toUserErrorMessage } from '@/lib/errorMessage';

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
  /** When set, a DELETE is in flight for that job id (avoids toggling global loading on detail pages). */
  deletingJobId: string | null;
  error: string | null;
  searchFilters: SearchFilters;
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  loading: false,
  deletingJobId: null,
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
    fetchJobsFailure(state, action: PayloadAction<unknown>) {
      state.loading = false;
      state.error = toUserErrorMessage(action.payload, 'Failed to fetch jobs');
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
    createJobFailure(state, action: PayloadAction<unknown>) {
      state.loading = false;
      state.error = toUserErrorMessage(action.payload, 'Failed to create job');
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
    updateJobFailure(state, action: PayloadAction<unknown>) {
      state.loading = false;
      state.error = toUserErrorMessage(action.payload, 'Failed to update job');
    },
    deleteJob(state, action: PayloadAction<string>) {
      state.deletingJobId = action.payload;
      state.error = null;
    },
    deleteJobSuccess(state, action: PayloadAction<string>) {
      const deletedId = action.payload;
      state.jobs = state.jobs.filter((j) => j._id !== deletedId);
      if (state.currentJob?._id === deletedId) state.currentJob = null;
      state.deletingJobId = null;
    },
    deleteJobFailure(state, action: PayloadAction<unknown>) {
      state.deletingJobId = null;
      state.error = toUserErrorMessage(action.payload, 'Failed to delete job');
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
  deleteJob,
  deleteJobSuccess,
  deleteJobFailure,
  setSearchFilters,
  clearCurrentJob,
} = jobsSlice.actions;

export type { SearchFilters, JobsState };
export default jobsSlice.reducer;
