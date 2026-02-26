import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  const { isAuthenticated, login } = useAuth();

  const handleTalent = async () => {
    if (!isAuthenticated) {
      await login();
    }
    navigation.navigate('TalentDashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weir Here</Text>
      <Text style={styles.subtitle}>Your trusted staffing partner</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.card, styles.primaryCard]} onPress={handleTalent}>
          <Text style={styles.cardTitle}>I Need Talent</Text>
          <Text style={styles.cardText}>Find qualified candidates</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.card, styles.secondaryCard]}
          onPress={() => navigation.navigate('JobBoard')}
        >
          <Text style={styles.cardTitle}>I Need a Career</Text>
          <Text style={styles.cardText}>Browse open positions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#0066FF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40 },
  buttonContainer: { width: '100%', gap: 16 },
  card: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  primaryCard: { backgroundColor: '#0066FF' },
  secondaryCard: { backgroundColor: '#FF6B35' },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 4 },
  cardText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
});
