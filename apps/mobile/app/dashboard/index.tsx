import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../src/store';
import { ELECTRIC_BLUE } from '../../src/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (token === null) {
      router.replace('/login');
    }
  }, [token, router]);

  if (!token) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ELECTRIC_BLUE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome!
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        What would you like to do today?
      </Text>

      <View style={styles.cards}>
        <Surface style={styles.card} elevation={2}>
          <Button
            mode="text"
            onPress={() => router.push('/dashboard/post-job')}
            contentStyle={styles.cardContent}
            style={styles.cardButton}
          >
            <View style={styles.cardInner}>
              <MaterialCommunityIcons
                name="briefcase-plus-outline"
                size={56}
                color={ELECTRIC_BLUE}
              />
              <Text variant="titleLarge" style={styles.cardTitle}>
                I Need Talent
              </Text>
              <Text variant="bodySmall" style={styles.cardSub}>
                Post a new job listing
              </Text>
            </View>
          </Button>
        </Surface>

        <Surface style={styles.card} elevation={2}>
          <Button
            mode="text"
            onPress={() => router.push('/jobs')}
            contentStyle={styles.cardContent}
            style={styles.cardButton}
          >
            <View style={styles.cardInner}>
              <MaterialCommunityIcons
                name="account-search-outline"
                size={56}
                color={ELECTRIC_BLUE}
              />
              <Text variant="titleLarge" style={styles.cardTitle}>
                I Need a Career
              </Text>
              <Text variant="bodySmall" style={styles.cardSub}>
                Browse open positions
              </Text>
            </View>
          </Button>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  cards: {
    width: '100%',
    maxWidth: 340,
    gap: 20,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardButton: {
    borderRadius: 12,
  },
  cardContent: {
    paddingVertical: 28,
  },
  cardInner: {
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  cardSub: {
    color: '#888',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
