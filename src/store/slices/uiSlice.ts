import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  themeMode: 'light' | 'dark';
  mobileMenuOpen: boolean;
  snackbar: { open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' };
}

const initialState: UiState = {
  themeMode: 'light',
  mobileMenuOpen: false,
  snackbar: { open: false, message: '', severity: 'info' },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    setThemeMode(state, action: PayloadAction<'light' | 'dark'>) {
      state.themeMode = action.payload;
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.mobileMenuOpen = action.payload;
    },
    showSnackbar(
      state,
      action: PayloadAction<{ message: string; severity: UiState['snackbar']['severity'] }>
    ) {
      state.snackbar = { open: true, ...action.payload };
    },
    hideSnackbar(state) {
      state.snackbar.open = false;
    },
  },
});

export const { toggleTheme, setThemeMode, toggleMobileMenu, setMobileMenuOpen, showSnackbar, hideSnackbar } =
  uiSlice.actions;
export default uiSlice.reducer;
