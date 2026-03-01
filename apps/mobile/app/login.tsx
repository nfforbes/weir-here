import { View, StyleSheet } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../src/store';
import { loginAsync, clearError } from '../src/store/slices/authSlice';
import { ELECTRIC_BLUE } from '../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const handleLogin = async () => {
    dispatch(clearError());
    const result = await dispatch(loginAsync());
    if (loginAsync.fulfilled.match(result)) {
      router.replace('/dashboard');
    }
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="shield-account-outline"
        size={80}
        color={ELECTRIC_BLUE}
        style={styles.icon}
      />

      <Text variant="headlineMedium" style={styles.title}>
        Sign In
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Log in with your Auth0 account to access your dashboard and post jobs.
      </Text>

      {error && (
        <Text variant="bodyMedium" style={styles.error}>
          {error}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={handleLogin}
        disabled={loading}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {loading ? <ActivityIndicator color="#fff" size={20} /> : 'Log In with Auth0'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    maxWidth: 300,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    borderRadius: 8,
    minWidth: 220,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
