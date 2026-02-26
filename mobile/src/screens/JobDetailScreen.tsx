import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JobDetail'>;
  route: RouteProp<RootStackParamList, 'JobDetail'>;
};

interface JobData {
  title: string;
  location: string;
  employmentType: string;
  description: string;
  responsibilities: string;
  requirements: string;
  howToApply: string;
  salaryRange?: { min?: number; max?: number; currency?: string };
  skills: string[];
  benefits: string[];
  company?: { name: string };
}

export default function JobDetailScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const { isAuthenticated, login } = useAuth();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getJob(jobId);
        setJob(data.job);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to apply for this position.', [
        { text: 'Cancel' },
        { text: 'Login', onPress: login },
      ]);
      return;
    }
    navigation.navigate('Apply', { jobId });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 40 }} />;
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text>Job not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
      {job.company && <Text style={styles.company}>{job.company.name}</Text>}
      <Text style={styles.meta}>{job.location} · {job.employmentType}</Text>
      {job.salaryRange?.min && (
        <Text style={styles.salary}>
          {job.salaryRange.currency || 'USD'} {job.salaryRange.min?.toLocaleString()}
          {job.salaryRange.max ? ` - ${job.salaryRange.max.toLocaleString()}` : '+'}
        </Text>
      )}

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.body}>{job.description}</Text>

      <Text style={styles.sectionTitle}>Responsibilities</Text>
      <Text style={styles.body}>{job.responsibilities}</Text>

      <Text style={styles.sectionTitle}>Requirements</Text>
      <Text style={styles.body}>{job.requirements}</Text>

      {job.skills.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.body}>{job.skills.join(', ')}</Text>
        </>
      )}

      {job.benefits.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <Text style={styles.body}>{job.benefits.join(', ')}</Text>
        </>
      )}

      <Text style={styles.sectionTitle}>How to Apply</Text>
      <Text style={styles.body}>{job.howToApply}</Text>

      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <Text style={styles.applyText}>Apply Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  company: { fontSize: 16, color: '#666', marginBottom: 2 },
  meta: { fontSize: 14, color: '#888', marginBottom: 4 },
  salary: { fontSize: 14, color: '#2E7D32', fontWeight: '600', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  body: { fontSize: 15, color: '#333', lineHeight: 22 },
  applyButton: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 24,
  },
  applyText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
