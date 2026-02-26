import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface JobListItem {
  _id: string;
  title: string;
  location: string;
  employmentType: string;
  description: string;
  companyName: string;
  categories: string[];
  tags: string[];
  salaryRange?: { min?: number; max?: number; currency?: string };
  createdAt: string;
}

interface JobsState {
  items: JobListItem[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    category: string;
    location: string;
    tag: string;
  };
  totalPages: number;
  currentPage: number;
}

const initialState: JobsState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: '',
  filters: { category: '', location: '', tag: '' },
  totalPages: 1,
  currentPage: 1,
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    fetchJobsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchJobsSuccess(
      state,
      action: PayloadAction<{ items: JobListItem[]; totalPages: number; currentPage: number }>
    ) {
      state.items = action.payload.items;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.loading = false;
    },
    fetchJobsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<JobsState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { fetchJobsRequest, fetchJobsSuccess, fetchJobsFailure, setSearchQuery, setFilters } =
  jobsSlice.actions;
export default jobsSlice.reducer;
