import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toUserErrorMessage } from '@/lib/errorMessage';

export type SettingKey =
  | 'MS365_CLIENT_ID'
  | 'MS365_CLIENT_SECRET'
  | 'MS365_TENANT_ID'
  | 'MS365_MAIL_FROM'
  | 'MS365_MAIL_TO'
  | 'MS365_SHAREPOINT_SITE_ID'
  | 'MS365_RESUME_FOLDER_PATH'
  | 'MS365_LOGO_FOLDER_PATH'
  | 'MS365_JOB_ATTACHMENT_PATH';

interface SettingsState {
  settings: Record<string, string>;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: {},
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    fetchSettings(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSettingsSuccess(state, action: PayloadAction<Record<string, string>>) {
      state.settings = action.payload;
      state.loading = false;
    },
    fetchSettingsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    saveSettings(state, _action: PayloadAction<Record<string, string>>) {
      state.loading = true;
      state.error = null;
    },
    saveSettingsSuccess(state, action: PayloadAction<Record<string, string>>) {
      state.settings = action.payload;
      state.loading = false;
    },
    saveSettingsFailure(state, action: PayloadAction<unknown>) {
      state.loading = false;
      state.error = toUserErrorMessage(action.payload, 'Failed to save settings');
    },
  },
});

export const {
  fetchSettings,
  fetchSettingsSuccess,
  fetchSettingsFailure,
  saveSettings,
  saveSettingsSuccess,
  saveSettingsFailure,
} = settingsSlice.actions;

export type { SettingsState };
export default settingsSlice.reducer;
