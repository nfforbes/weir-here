import { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Searchbar, Card, Text, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { formatJobSalaryPlain, type IJob } from '@weir-here/shared';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { fetchJobs, setSearchQuery } from '../../src/store/slices/jobsSlice';
import { ELECTRIC_BLUE } from '../../src/theme';

function JobCard({ job }: { job: IJob }) {
  const router = useRouter();

  const salary = formatJobSalaryPlain(job.salaryRange);

  return (
    <Card style={styles.card} onPress={() => router.push(`/jobs/${job._id}`)}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.jobTitle}>
          {job.title}
        </Text>

        <View style={styles.chipRow}>
          <Chip icon="map-marker-outline" compact textStyle={styles.chipText}>
            {job.location}
          </Chip>
          <Chip icon="briefcase-outline" compact textStyle={styles.chipText}>
            {job.employmentType}
          </Chip>
        </View>

        {salary && (
          <Text variant="bodySmall" style={styles.salary}>
            {salary}
          </Text>
        )}

        <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
          {job.description}
        </Text>
      </Card.Content>
    </Card>
  );
}

export default function JobsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { jobs, loading, error, searchQuery } = useAppSelector((s) => s.jobs);

  const loadJobs = useCallback(() => {
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    dispatch(fetchJobs(params));
  }, [dispatch, searchQuery]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const filteredJobs = searchQuery.trim()
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : jobs;

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search jobs…"
        value={searchQuery}
        onChangeText={(q) => dispatch(setSearchQuery(q))}
        onSubmitEditing={loadJobs}
        style={styles.searchBar}
      />

      {loading && jobs.length === 0 && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ELECTRIC_BLUE} />
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="text" onPress={loadJobs}>
            Retry
          </Button>
        </View>
      )}

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item._id ?? item.title}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadJobs} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>No jobs found matching your criteria.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    borderRadius: 8,
    elevation: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 12,
    borderRadius: 10,
  },
  jobTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
  },
  salary: {
    color: '#388e3c',
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    color: '#666',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    paddingVertical: 48,
    fontSize: 15,
  },
});
