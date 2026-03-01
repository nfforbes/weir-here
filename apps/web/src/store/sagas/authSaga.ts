import { call, put, takeLatest } from 'redux-saga/effects';
import {
  bootstrapUser,
  bootstrapUserSuccess,
  bootstrapUserFailure,
} from '@/store/slices/authSlice';
import type { AuthUser } from '@/store/slices/authSlice';

async function fetchAuthMe(): Promise<{ email: string; name: string; sub: string; email_verified: boolean }> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

async function postBootstrapUser(auth0Profile: {
  email: string;
  name: string;
  sub: string;
  email_verified: boolean;
}): Promise<AuthUser> {
  const res = await fetch('/api/users/bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(auth0Profile),
  });
  if (!res.ok) throw new Error('Failed to bootstrap user');
  return res.json();
}

function* handleBootstrapUser() {
  try {
    const auth0Profile: Awaited<ReturnType<typeof fetchAuthMe>> = yield call(fetchAuthMe);
    const user: AuthUser = yield call(postBootstrapUser, auth0Profile);
    yield put(bootstrapUserSuccess(user));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bootstrap failed';
    yield put(bootstrapUserFailure(message));
  }
}

export default function* authSaga() {
  yield takeLatest(bootstrapUser.type, handleBootstrapUser);
}
