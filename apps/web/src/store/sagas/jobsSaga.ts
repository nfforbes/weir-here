import { call, put, select, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { IJob } from '@weir-here/shared';
import {
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
} from '@/store/slices/jobsSlice';
import type { SearchFilters } from '@/store/slices/jobsSlice';
import type { RootState } from '@/store';

async function getJobs(filters: SearchFilters): Promise<{ jobs: IJob[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.query) params.set('query', filters.query);
  if (filters.category) params.set('category', filters.category);
  if (filters.location) params.set('location', filters.location);
  if (filters.tags.length) params.set('tags', filters.tags.join(','));
  params.set('page', String(filters.page));
  params.set('limit', String(filters.limit));

  const res = await fetch(`/api/jobs?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

async function getJob(id: string): Promise<IJob> {
  const res = await fetch(`/api/jobs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch job');
  const data = await res.json();
  return data?.job ?? data;
}

async function parseJobResponse(res: Response): Promise<IJob> {
  const data = (await res.json()) as { job?: IJob; error?: string };
  if (data?.job) return data.job;
  throw new Error(typeof data?.error === 'string' ? data.error : 'Request failed');
}

async function postJob(data: Partial<IJob>): Promise<IJob> {
  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to create job');
  }
  return parseJobResponse(res);
}

async function putJob(id: string, data: Partial<IJob>): Promise<IJob> {
  const res = await fetch(`/api/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to update job');
  }
  return parseJobResponse(res);
}

async function apiDeleteJob(id: string): Promise<void> {
  const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to delete job');
  }
}

function* handleFetchJobs() {
  try {
    const filters: SearchFilters = yield select(
      (state: RootState) => state.jobs.searchFilters
    );
    const data: { jobs?: IJob[]; total?: number } = yield call(getJobs, filters);
    const list = Array.isArray(data?.jobs) ? data.jobs : [];
    yield put(fetchJobsSuccess(list));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
    yield put(fetchJobsFailure(message));
  }
}

function* handleFetchJob(action: PayloadAction<string>) {
  try {
    const job: IJob = yield call(getJob, action.payload);
    yield put(fetchJobSuccess(job));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch job';
    yield put(fetchJobFailure(message));
  }
}

function* handleCreateJob(action: PayloadAction<Partial<IJob>>) {
  try {
    const job: IJob = yield call(postJob, action.payload);
    yield put(createJobSuccess(job));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create job';
    yield put(createJobFailure(message));
  }
}

function* handleUpdateJob(action: PayloadAction<{ id: string; data: Partial<IJob> }>) {
  try {
    const job: IJob = yield call(putJob, action.payload.id, action.payload.data);
    yield put(updateJobSuccess(job));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update job';
    yield put(updateJobFailure(message));
  }
}

function* handleDeleteJob(action: PayloadAction<string>) {
  try {
    yield call(apiDeleteJob, action.payload);
    yield put(deleteJobSuccess(action.payload));
  } catch (err: unknown) {
    yield put(deleteJobFailure(err));
  }
}

export default function* jobsSaga() {
  yield takeLatest(fetchJobs.type, handleFetchJobs);
  yield takeLatest(fetchJob.type, handleFetchJob);
  yield takeLatest(createJob.type, handleCreateJob);
  yield takeLatest(updateJob.type, handleUpdateJob);
  yield takeLatest(deleteJob.type, handleDeleteJob);
}
