import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CompanyJobs'>;
  route: RouteProp<RootStackParamList, 'CompanyJobs'>;
};

interface Job {
  _id: string;
  title: string;
  status: string;
  location: string;
}

export default function CompanyJobsScreen({ route, navigation }: Props) {
  const { companyName } = route.params;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getJobs();
        setJobs(data.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{companyName} - Jobs</Text>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ApplicationsReview', { jobId: item._id })}
          >
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.meta}>{item.location} · {item.status}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No jobs posted yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F7FA' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  jobTitle: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13, color: '#888', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 40 },
});
