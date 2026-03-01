import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser, Persona } from '@weir-here/shared';

interface AuthUser {
  auth0Id: string;
  email: string;
  name: string;
  personas: Persona[];
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    bootstrapUser(state) {
      state.loading = true;
      state.error = null;
    },
    bootstrapUserSuccess(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    bootstrapUserFailure(state, action: PayloadAction<string>) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  clearUser,
  setLoading,
  setError,
  bootstrapUser,
  bootstrapUserSuccess,
  bootstrapUserFailure,
} = authSlice.actions;

export type { AuthUser, AuthState };
export default authSlice.reducer;
