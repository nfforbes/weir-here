import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  fetchSettings,
  fetchSettingsSuccess,
  fetchSettingsFailure,
  saveSettings,
  saveSettingsSuccess,
  saveSettingsFailure,
} from '@/store/slices/settingsSlice';

async function getSettings(): Promise<Record<string, string>> {
  const res = await fetch('/api/admin/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  const data = await res.json();
  return data.settings || {};
}

async function putSettings(
  settings: Record<string, string>
): Promise<Record<string, string>> {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  const data = await res.json();
  return data.settings || settings;
}

function* handleFetchSettings() {
  try {
    const settings: Record<string, string> = yield call(getSettings);
    yield put(fetchSettingsSuccess(settings));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch settings';
    yield put(fetchSettingsFailure(message));
  }
}

function* handleSaveSettings(action: PayloadAction<Record<string, string>>) {
  try {
    const settings: Record<string, string> = yield call(
      putSettings,
      action.payload
    );
    yield put(saveSettingsSuccess(settings));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to save settings';
    yield put(saveSettingsFailure(message));
  }
}

export default function* settingsSaga() {
  yield takeLatest(fetchSettings.type, handleFetchSettings);
  yield takeLatest(saveSettings.type, handleSaveSettings);
}
