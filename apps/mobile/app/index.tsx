import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../src/store';
import { ELECTRIC_BLUE } from '../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);

  const handleTalent = () => {
    if (token) {
      router.push('/dashboard/post-job');
    } else {
      router.push('/login');
    }
  };

  const handleCareer = () => {
    router.push('/jobs');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome to Weir Here Staffing
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Connecting talent with opportunity.{'\n'}How can we help you today?
      </Text>

      <View style={styles.cards}>
        <Surface style={styles.card} elevation={2}>
          <Button
            mode="text"
            onPress={handleTalent}
            contentStyle={styles.cardContent}
            style={styles.cardButton}
          >
            <View style={styles.cardInner}>
              <MaterialCommunityIcons
                name="briefcase-outline"
                size={64}
                color={ELECTRIC_BLUE}
              />
              <Text variant="titleLarge" style={styles.cardTitle}>
                I Need Talent
              </Text>
              <Text variant="bodySmall" style={styles.cardSub}>
                Post a job and find the right candidates
              </Text>
            </View>
          </Button>
        </Surface>

        <Surface style={styles.card} elevation={2}>
          <Button
            mode="text"
            onPress={handleCareer}
            contentStyle={styles.cardContent}
            style={styles.cardButton}
          >
            <View style={styles.cardInner}>
              <MaterialCommunityIcons
                name="account-search-outline"
                size={64}
                color={ELECTRIC_BLUE}
              />
              <Text variant="titleLarge" style={styles.cardTitle}>
                I Need a Career
              </Text>
              <Text variant="bodySmall" style={styles.cardSub}>
                Browse open positions and apply today
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
    paddingVertical: 32,
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
});
