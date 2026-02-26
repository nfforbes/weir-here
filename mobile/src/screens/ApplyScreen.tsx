import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { api } from '../api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Apply'>;
  route: RouteProp<RootStackParamList, 'Apply'>;
};

export default function ApplyScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const [submitting, setSubmitting] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');

  const handleSubmit = async () => {
    if (!resumeUrl.trim()) {
      Alert.alert('Error', 'Please provide a resume URL or upload path.');
      return;
    }

    setSubmitting(true);
    try {
      await api.applyForJob({ jobId, resumeUrl, screeningAnswers: [] });
      Alert.alert('Success', 'Your application has been submitted!', [
        { text: 'OK', onPress: () => navigation.navigate('JobBoard') },
      ]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apply for Position</Text>
      <Text style={styles.label}>Resume URL</Text>
      <TextInput
        style={styles.input}
        value={resumeUrl}
        onChangeText={setResumeUrl}
        placeholder="https://link-to-your-resume.pdf"
        autoCapitalize="none"
      />
      <Text style={styles.hint}>
        Note: Full file upload is available on the web version. For mobile, provide a link to your resume.
      </Text>
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.disabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Application'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  hint: { fontSize: 13, color: '#999', marginBottom: 24 },
  submitButton: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
