import { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Chip, Divider, ActivityIndicator, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { fetchJob, clearCurrentJob } from '../../src/store/slices/jobsSlice';
import { ELECTRIC_BLUE } from '../../src/theme';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentJob: job, loading, error } = useAppSelector((s) => s.jobs);
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (id) dispatch(fetchJob(id));
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [id, dispatch]);

  const handleApply = () => {
    if (!token) {
      router.push('/login');
      return;
    }
    // TODO: navigate to an apply form screen
    router.push('/login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ELECTRIC_BLUE} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="text" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text>Job not found.</Text>
      </View>
    );
  }

  const salary =
    job.salaryRange.min || job.salaryRange.max
      ? `${job.salaryRange.currency} ${job.salaryRange.min.toLocaleString()} – ${job.salaryRange.max.toLocaleString()}`
      : null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Surface style={styles.surface} elevation={1}>
        <Text variant="headlineSmall" style={styles.title}>
          {job.title}
        </Text>

        <View style={styles.chipRow}>
          <Chip icon="map-marker-outline" compact>
            {job.location}
          </Chip>
          <Chip icon="briefcase-outline" compact>
            {job.employmentType}
          </Chip>
          {salary && (
            <Chip icon="currency-usd" compact>
              {salary}
            </Chip>
          )}
        </View>

        <Divider style={styles.divider} />

        <Section title="Description" body={job.description} />
        <Section title="Responsibilities" body={job.responsibilities} />
        <Section title="Requirements" body={job.requirements} />
        <Section title="How to Apply" body={job.howToApply} />

        {job.skills.length > 0 && (
          <>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Skills
            </Text>
            <View style={styles.chipRow}>
              {job.skills.map((s) => (
                <Chip key={s} compact>
                  {s}
                </Chip>
              ))}
            </View>
          </>
        )}

        {job.benefits.length > 0 && (
          <>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Benefits
            </Text>
            <View style={styles.chipRow}>
              {job.benefits.map((b) => (
                <Chip key={b} compact mode="outlined">
                  {b}
                </Chip>
              ))}
            </View>
          </>
        )}

        {job.screeningQuestions.length > 0 && (
          <>
            <Divider style={styles.divider} />
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Screening Questions
            </Text>
            {job.screeningQuestions.map((q, i) => (
              <View key={q.id} style={styles.questionRow}>
                <Text variant="bodyMedium">
                  {i + 1}. {q.question}
                </Text>
                <Text variant="bodySmall" style={styles.questionMeta}>
                  Type: {q.type} {q.required ? '(Required)' : ''}
                </Text>
              </View>
            ))}
          </>
        )}
      </Surface>

      <Button
        mode="contained"
        onPress={handleApply}
        style={styles.applyButton}
        contentStyle={styles.applyButtonContent}
        labelStyle={styles.applyButtonLabel}
      >
        Apply Now
      </Button>
    </ScrollView>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <>
      <Text variant="titleSmall" style={styles.sectionTitle}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.sectionBody}>
        {body}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  surface: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  sectionBody: {
    color: '#444',
    marginBottom: 8,
    lineHeight: 22,
  },
  questionRow: {
    marginBottom: 8,
    paddingLeft: 4,
  },
  questionMeta: {
    color: '#888',
    marginTop: 2,
  },
  applyButton: {
    borderRadius: 8,
    alignSelf: 'center',
    minWidth: 200,
  },
  applyButtonContent: {
    paddingVertical: 6,
  },
  applyButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
});
