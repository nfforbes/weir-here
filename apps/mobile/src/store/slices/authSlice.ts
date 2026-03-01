import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authService from '../../services/auth';
import { api } from '../../services/api';

interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  loading: false,
  error: null,
};

export const restoreToken = createAsyncThunk('auth/restoreToken', async () => {
  const token = await authService.getStoredToken();
  if (token) api.setToken(token);
  return token;
});

export const loginAsync = createAsyncThunk('auth/login', async () => {
  const result = await authService.login();
  if (!result) throw new Error('Login cancelled');
  api.setToken(result.accessToken);
  return result.accessToken;
});

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
  api.clearToken();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreToken.fulfilled, (state, action: PayloadAction<string | null>) => {
        state.token = action.payload;
      })
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.token = action.payload;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Login failed';
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
