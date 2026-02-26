import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { api } from '../api';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';

type Props = { route: RouteProp<RootStackParamList, 'ApplicationsReview'> };

interface Application {
  _id: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  reviews: { rating: number; eliminated: boolean }[];
}

export default function ApplicationsReviewScreen({ route }: Props) {
  const { jobId } = route.params;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState('5');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getApplications(jobId);
        setApplications(data.applications || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  const submitReview = async (applicationId: string, eliminated: boolean) => {
    const r = parseFloat(rating);
    if (isNaN(r) || r < 0 || r > 10) {
      Alert.alert('Error', 'Rating must be between 0 and 10');
      return;
    }
    try {
      await api.submitReview({ applicationId, rating: r, eliminated });
      Alert.alert('Success', 'Review submitted');
      const data = await api.getApplications(jobId);
      setApplications(data.applications || []);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Applicants</Text>
      <FlatList
        data={applications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const avg = item.reviews.length
            ? (item.reviews.reduce((s, r) => s + r.rating, 0) / item.reviews.length).toFixed(1)
            : '-';
          return (
            <View style={styles.card}>
              <Text style={styles.name}>{item.applicantName}</Text>
              <Text style={styles.email}>{item.applicantEmail}</Text>
              <Text style={styles.meta}>Status: {item.status} · Avg: {avg}/10</Text>
              <View style={styles.actions}>
                <TextInput
                  style={styles.ratingInput}
                  value={rating}
                  onChangeText={setRating}
                  keyboardType="decimal-pad"
                  placeholder="Rating"
                />
                <TouchableOpacity style={styles.rateBtn} onPress={() => submitReview(item._id, false)}>
                  <Text style={styles.btnText}>Rate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.eliminateBtn} onPress={() => submitReview(item._id, true)}>
                  <Text style={styles.btnText}>Eliminate</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No applicants yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F7FA' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  name: { fontSize: 16, fontWeight: '600' },
  email: { fontSize: 14, color: '#666' },
  meta: { fontSize: 13, color: '#888', marginTop: 4, marginBottom: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, width: 60, textAlign: 'center' },
  rateBtn: { backgroundColor: '#0066FF', padding: 10, borderRadius: 8 },
  eliminateBtn: { backgroundColor: '#d32f2f', padding: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 40 },
});
