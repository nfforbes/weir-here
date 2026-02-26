import { all, fork } from 'redux-saga/effects';
import { watchJobsSagas } from './sagas/jobsSaga';

export function* rootSaga() {
  yield all([fork(watchJobsSagas)]);
}
