import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IApplication, ApplicationStatus } from '@weir-here/shared';
import { toUserErrorMessage } from '@/lib/errorMessage';

interface ApplicationsState {
  applications: IApplication[];
  currentApplication: IApplication | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,
};

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    fetchApplications(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    fetchApplicationsSuccess(state, action: PayloadAction<IApplication[]>) {
      state.applications = action.payload;
      state.loading = false;
    },
    fetchApplicationsFailure(state, action: PayloadAction<unknown>) {
      state.loading = false;
      state.error = toUserErrorMessage(action.payload, 'Failed to fetch applications');
    },
    submitApplication(state, _action: PayloadAction<FormData>) {
      state.loading = true;
      state.error = null;
    },
    submitApplicationSuccess(state, action: PayloadAction<IApplication>) {
      state.applications.push(action.payload);
      state.loading = false;
    },
    submitApplicationFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateApplicationStatus(
      state,
      _action: PayloadAction<{ id: string; status: ApplicationStatus }>
    ) {
      state.loading = true;
      state.error = null;
    },
    updateApplicationStatusSuccess(state, action: PayloadAction<IApplication>) {
      const index = state.applications.findIndex(
        (a) => a._id === action.payload._id
      );
      if (index !== -1) state.applications[index] = action.payload;
      if (state.currentApplication?._id === action.payload._id) {
        state.currentApplication = action.payload;
      }
      state.loading = false;
    },
    updateApplicationStatusFailure(state, action: PayloadAction<unknown>) {
      state.loading = false;
      state.error = toUserErrorMessage(action.payload, 'Failed to update application status');
    },
  },
});

export const {
  fetchApplications,
  fetchApplicationsSuccess,
  fetchApplicationsFailure,
  submitApplication,
  submitApplicationSuccess,
  submitApplicationFailure,
  updateApplicationStatus,
  updateApplicationStatusSuccess,
  updateApplicationStatusFailure,
} = applicationsSlice.actions;

export type { ApplicationsState };
export default applicationsSlice.reducer;
