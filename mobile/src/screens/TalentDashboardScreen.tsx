import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'TalentDashboard'> };

interface Company {
  _id: string;
  name: string;
  industry: string;
}

export default function TalentDashboardScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const data = await api.getCompanies();
        setCompanies(data.companies || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Companies</Text>
      {companies.length === 0 ? (
        <View>
          <Text style={styles.empty}>No companies registered yet.</Text>
          <Text style={styles.hint}>Please register a company on the web to start posting jobs.</Text>
        </View>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CompanyJobs', { companyId: item._id, companyName: item.name })}
            >
              <Text style={styles.companyName}>{item.name}</Text>
              <Text style={styles.industry}>{item.industry}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F7FA' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  companyName: { fontSize: 18, fontWeight: '600' },
  industry: { fontSize: 14, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 40 },
  hint: { textAlign: 'center', color: '#aaa', fontSize: 14, marginTop: 8 },
});
