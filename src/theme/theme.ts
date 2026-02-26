'use client';

import { createTheme } from '@mui/material/styles';

const ELECTRIC_BLUE = '#0066FF';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ELECTRIC_BLUE },
    secondary: { main: '#FF6B35' },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: ELECTRIC_BLUE },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: ELECTRIC_BLUE },
    secondary: { main: '#FF6B35' },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: ELECTRIC_BLUE },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
  },
});
