import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { api } from '../api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'JobBoard'> };

interface Job {
  _id: string;
  title: string;
  location: string;
  employmentType: string;
  description: string;
  companyName: string;
  tags: string[];
}

export default function JobBoardScreen({ navigation }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (query) params.q = query;
      const data = await api.getJobs(params);
      setJobs(data.items);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search jobs..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={fetchJobs}
        returnKeyType="search"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}
            >
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.company}>{item.companyName}</Text>
              <Text style={styles.location}>{item.location} · {item.employmentType}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No jobs found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F7FA' },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  company: { fontSize: 14, color: '#666', marginBottom: 2 },
  location: { fontSize: 13, color: '#888', marginBottom: 8 },
  description: { fontSize: 14, color: '#444' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
});
