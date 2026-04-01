import { call, put, takeLatest } from 'redux-saga/effects';
import type { IUser } from '@weir-here/shared';
import {
  bootstrapUser,
  bootstrapUserSuccess,
  bootstrapUserFailure,
} from '@/store/slices/authSlice';
import type { AuthUser } from '@/store/slices/authSlice';

async function postBootstrapUser(): Promise<AuthUser> {
  const res = await fetch('/api/users/bootstrap', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to bootstrap user');
  const data = (await res.json()) as { user?: IUser };
  const u = data.user;
  if (!u) throw new Error('Invalid bootstrap response');
  const personas = Array.isArray(u.personas) ? u.personas : (['user'] as IUser['personas']);
  return {
    auth0Id: u.auth0Id,
    email: u.email,
    name: u.name,
    personas,
    emailVerified: u.emailVerified,
  };
}

function* handleBootstrapUser() {
  try {
    const user: AuthUser = yield call(postBootstrapUser);
    yield put(bootstrapUserSuccess(user));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bootstrap failed';
    yield put(bootstrapUserFailure(message));
  }
}

export default function* authSaga() {
  yield takeLatest(bootstrapUser.type, handleBootstrapUser);
}
