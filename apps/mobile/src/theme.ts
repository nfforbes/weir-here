import { MD3LightTheme, configureFonts } from 'react-native-paper';

export const DEEP_NAVY = '#0a1929';
export const ELECTRIC_BLUE = '#1976d2';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: ELECTRIC_BLUE,
    primaryContainer: '#e3f2fd',
    secondary: '#ff9800',
    secondaryContainer: '#fff3e0',
    background: '#f5f7fa',
    surface: '#ffffff',
    error: '#d32f2f',
  },
  roundness: 8,
};
