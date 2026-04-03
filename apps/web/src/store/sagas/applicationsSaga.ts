import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { IApplication, ApplicationStatus } from '@weir-here/shared';
import {
  fetchApplications,
  fetchApplicationsSuccess,
  fetchApplicationsFailure,
  submitApplication,
  submitApplicationSuccess,
  submitApplicationFailure,
  updateApplicationStatus,
  updateApplicationStatusSuccess,
  updateApplicationStatusFailure,
} from '@/store/slices/applicationsSlice';

async function getApplications(jobId: string): Promise<IApplication[]> {
  const res = await fetch(`/api/applications?jobId=${encodeURIComponent(jobId)}`);
  const data = (await res.json().catch(() => ({}))) as {
    applications?: IApplication[];
    error?: string;
  };
  if (!res.ok) {
    throw new Error(
      typeof data.error === 'string' ? data.error : 'Failed to fetch applications',
    );
  }
  return Array.isArray(data?.applications) ? data.applications : [];
}

async function postApplication(formData: FormData): Promise<IApplication> {
  const res = await fetch('/api/applications', {
    method: 'POST',
    body: formData,
  });
  const data = (await res.json().catch(() => ({}))) as {
    application?: IApplication;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(
      typeof data.error === 'string' ? data.error : 'Failed to submit application',
    );
  }
  if (data.application) return data.application;
  throw new Error('Failed to submit application');
}

async function patchApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<IApplication> {
  const res = await fetch(`/api/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    application?: IApplication;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(
      typeof data.error === 'string'
        ? data.error
        : 'Failed to update application status',
    );
  }
  if (data.application) return data.application;
  throw new Error('Failed to update application status');
}

function* handleFetchApplications(action: PayloadAction<string>) {
  try {
    const apps: IApplication[] = yield call(getApplications, action.payload);
    yield put(fetchApplicationsSuccess(apps));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch applications';
    yield put(fetchApplicationsFailure(message));
  }
}

function* handleSubmitApplication(action: PayloadAction<FormData>) {
  try {
    const app: IApplication = yield call(postApplication, action.payload);
    yield put(submitApplicationSuccess(app));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to submit application';
    yield put(submitApplicationFailure(message));
  }
}

function* handleUpdateApplicationStatus(
  action: PayloadAction<{ id: string; status: ApplicationStatus }>
) {
  try {
    const app: IApplication = yield call(
      patchApplicationStatus,
      action.payload.id,
      action.payload.status
    );
    yield put(updateApplicationStatusSuccess(app));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to update application status';
    yield put(updateApplicationStatusFailure(message));
  }
}

export default function* applicationsSaga() {
  yield takeLatest(fetchApplications.type, handleFetchApplications);
  yield takeLatest(submitApplication.type, handleSubmitApplication);
  yield takeLatest(updateApplicationStatus.type, handleUpdateApplicationStatus);
}
