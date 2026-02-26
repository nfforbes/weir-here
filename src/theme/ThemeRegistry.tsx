'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { lightTheme, darkTheme } from './theme';
import EmotionCacheProvider from './EmotionCache';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const themeMode = useAppSelector((s) => s.ui.themeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <EmotionCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionCacheProvider>
  );
}
