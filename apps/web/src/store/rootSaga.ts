import { fork } from 'redux-saga/effects';
import authSaga from '@/store/sagas/authSaga';
import jobsSaga from '@/store/sagas/jobsSaga';
import applicationsSaga from '@/store/sagas/applicationsSaga';
import reviewsSaga from '@/store/sagas/reviewsSaga';
import settingsSaga from '@/store/sagas/settingsSaga';

export default function* rootSaga() {
  yield fork(authSaga);
  yield fork(jobsSaga);
  yield fork(applicationsSaga);
  yield fork(reviewsSaga);
  yield fork(settingsSaga);
}
