import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  fetchJobsRequest,
  fetchJobsSuccess,
  fetchJobsFailure,
} from '../slices/jobsSlice';
import type { RootState } from '../store';

async function fetchJobsApi(params: {
  query: string;
  category: string;
  location: string;
  tag: string;
  page: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set('q', params.query);
  if (params.category) searchParams.set('category', params.category);
  if (params.location) searchParams.set('location', params.location);
  if (params.tag) searchParams.set('tag', params.tag);
  searchParams.set('page', String(params.page));

  const res = await fetch(`/api/jobs?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

function* handleFetchJobs(): Generator {
  try {
    const state = (yield select((s: RootState) => s.jobs)) as RootState['jobs'];
    const data = (yield call(fetchJobsApi, {
      query: state.searchQuery,
      category: state.filters.category,
      location: state.filters.location,
      tag: state.filters.tag,
      page: state.currentPage,
    })) as { items: RootState['jobs']['items']; totalPages: number; currentPage: number };

    yield put(fetchJobsSuccess(data));
  } catch (err) {
    yield put(fetchJobsFailure(err instanceof Error ? err.message : 'Unknown error'));
  }
}

export function* watchJobsSagas() {
  yield takeLatest(fetchJobsRequest.type, handleFetchJobs);
}
