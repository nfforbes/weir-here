'use client';

import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './rootSaga';
import authReducer from './slices/authSlice';
import jobsReducer from './slices/jobsSlice';
import uiReducer from './slices/uiSlice';

const sagaMiddleware = createSagaMiddleware();

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      jobs: jobsReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(sagaMiddleware),
  });

  sagaMiddleware.run(rootSaga);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
