import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, useAppDispatch } from '../src/store';
import { restoreToken } from '../src/store/slices/authSlice';
import { theme, DEEP_NAVY } from '../src/theme';

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreToken());
  }, [dispatch]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: DEEP_NAVY },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Weir Here' }} />
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="jobs/index" options={{ title: 'Job Board' }} />
      <Stack.Screen name="jobs/[id]" options={{ title: 'Job Details' }} />
      <Stack.Screen name="dashboard/index" options={{ title: 'Careers' }} />
      <Stack.Screen name="dashboard/post-job" options={{ title: 'Post a Job' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AppContent />
        </PaperProvider>
      </SafeAreaProvider>
    </ReduxProvider>
  );
}
