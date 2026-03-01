import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Chip,
  SegmentedButtons,
  Divider,
  ActivityIndicator,
  HelperText,
  Surface,
  Snackbar,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import type { EmploymentType } from '@weir-here/shared';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { createJob, clearError } from '../../src/store/slices/jobsSlice';
import { ELECTRIC_BLUE } from '../../src/theme';

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temp' },
  { value: 'internship', label: 'Intern' },
];

const CATEGORY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Other',
];

export default function PostJobScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const { loading, error } = useAppSelector((s) => s.jobs);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full-time');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [howToApply, setHowToApply] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency] = useState('USD');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const addChip = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const trimmed = value.trim();
    if (trimmed) {
      setter((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
      inputSetter('');
    }
  };

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Required';
    if (!location.trim()) e.location = 'Required';
    if (!description.trim()) e.description = 'Required';
    if (!responsibilities.trim()) e.responsibilities = 'Required';
    if (!requirements.trim()) e.requirements = 'Required';
    if (!howToApply.trim()) e.howToApply = 'Required';
    if (!salaryMin || Number(salaryMin) < 0) e.salaryMin = 'Required';
    if (!salaryMax || Number(salaryMax) < 0) e.salaryMax = 'Required';
    if (selectedCategories.length === 0) e.categories = 'Select at least one';
    if (!expiresAt.trim()) e.expiresAt = 'Required (YYYY-MM-DD)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [title, location, description, responsibilities, requirements, howToApply, salaryMin, salaryMax, selectedCategories, expiresAt]);

  const handleSubmit = async () => {
    if (!validate()) return;
    dispatch(clearError());

    const result = await dispatch(
      createJob({
        title: title.trim(),
        location: location.trim(),
        employmentType,
        description: description.trim(),
        responsibilities: responsibilities.trim(),
        requirements: requirements.trim(),
        howToApply: howToApply.trim(),
        salaryRange: { min: Number(salaryMin), max: Number(salaryMax), currency },
        categories: selectedCategories,
        tags,
        expiresAt,
        screeningQuestions: [],
        skills,
        benefits,
        reviewerEmails: [],
      }),
    );

    if (createJob.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => router.back(), 1500);
    }
  };

  if (!token) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ELECTRIC_BLUE} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Surface style={styles.surface} elevation={1}>
        <Text variant="titleLarge" style={styles.heading}>
          Post a New Job
        </Text>
        <Text variant="bodyMedium" style={styles.subheading}>
          Fill out the form below to create a new job listing.
        </Text>

        <Divider style={styles.divider} />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Basic Information
        </Text>

        <TextInput
          label="Job Title *"
          mode="outlined"
          value={title}
          onChangeText={setTitle}
          error={!!errors.title}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.title}>{errors.title}</HelperText>

        <TextInput
          label="Location *"
          mode="outlined"
          value={location}
          onChangeText={setLocation}
          error={!!errors.location}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.location}>{errors.location}</HelperText>

        <Text variant="bodySmall" style={styles.fieldLabel}>
          Employment Type
        </Text>
        <SegmentedButtons
          value={employmentType}
          onValueChange={(v) => setEmploymentType(v as EmploymentType)}
          buttons={EMPLOYMENT_TYPES}
          style={styles.segmented}
        />

        <Divider style={styles.divider} />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Details
        </Text>

        <TextInput
          label="Description *"
          mode="outlined"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          error={!!errors.description}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.description}>{errors.description}</HelperText>

        <TextInput
          label="Responsibilities *"
          mode="outlined"
          value={responsibilities}
          onChangeText={setResponsibilities}
          multiline
          numberOfLines={3}
          error={!!errors.responsibilities}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.responsibilities}>{errors.responsibilities}</HelperText>

        <TextInput
          label="Requirements *"
          mode="outlined"
          value={requirements}
          onChangeText={setRequirements}
          multiline
          numberOfLines={3}
          error={!!errors.requirements}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.requirements}>{errors.requirements}</HelperText>

        <TextInput
          label="How to Apply *"
          mode="outlined"
          value={howToApply}
          onChangeText={setHowToApply}
          error={!!errors.howToApply}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.howToApply}>{errors.howToApply}</HelperText>

        <Divider style={styles.divider} />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Compensation
        </Text>

        <View style={styles.row}>
          <TextInput
            label="Min Salary *"
            mode="outlined"
            value={salaryMin}
            onChangeText={setSalaryMin}
            keyboardType="numeric"
            error={!!errors.salaryMin}
            style={[styles.input, styles.flex1]}
          />
          <TextInput
            label="Max Salary *"
            mode="outlined"
            value={salaryMax}
            onChangeText={setSalaryMax}
            keyboardType="numeric"
            error={!!errors.salaryMax}
            style={[styles.input, styles.flex1]}
          />
        </View>

        <Divider style={styles.divider} />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Categories *
        </Text>
        {!!errors.categories && (
          <HelperText type="error" visible>{errors.categories}</HelperText>
        )}
        <View style={styles.chipRow}>
          {CATEGORY_OPTIONS.map((cat) => (
            <Chip
              key={cat}
              selected={selectedCategories.includes(cat)}
              onPress={() => toggleCategory(cat)}
              showSelectedCheck
              style={styles.categoryChip}
            >
              {cat}
            </Chip>
          ))}
        </View>

        <TextInput
          label="Expiration Date (YYYY-MM-DD) *"
          mode="outlined"
          value={expiresAt}
          onChangeText={setExpiresAt}
          error={!!errors.expiresAt}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.expiresAt}>{errors.expiresAt}</HelperText>

        <Divider style={styles.divider} />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Additional Details
        </Text>

        <TextInput
          label="Add Tag"
          mode="outlined"
          value={tagInput}
          onChangeText={setTagInput}
          right={
            <TextInput.Icon icon="plus" onPress={() => addChip(tagInput, setTags, setTagInput)} />
          }
          onSubmitEditing={() => addChip(tagInput, setTags, setTagInput)}
          style={styles.input}
        />
        <View style={styles.chipRow}>
          {tags.map((t) => (
            <Chip key={t} onClose={() => setTags((p) => p.filter((x) => x !== t))}>
              {t}
            </Chip>
          ))}
        </View>

        <TextInput
          label="Add Skill"
          mode="outlined"
          value={skillInput}
          onChangeText={setSkillInput}
          right={
            <TextInput.Icon icon="plus" onPress={() => addChip(skillInput, setSkills, setSkillInput)} />
          }
          onSubmitEditing={() => addChip(skillInput, setSkills, setSkillInput)}
          style={styles.input}
        />
        <View style={styles.chipRow}>
          {skills.map((s) => (
            <Chip key={s} onClose={() => setSkills((p) => p.filter((x) => x !== s))}>
              {s}
            </Chip>
          ))}
        </View>

        <TextInput
          label="Add Benefit"
          mode="outlined"
          value={benefitInput}
          onChangeText={setBenefitInput}
          right={
            <TextInput.Icon icon="plus" onPress={() => addChip(benefitInput, setBenefits, setBenefitInput)} />
          }
          onSubmitEditing={() => addChip(benefitInput, setBenefits, setBenefitInput)}
          style={styles.input}
        />
        <View style={styles.chipRow}>
          {benefits.map((b) => (
            <Chip key={b} onClose={() => setBenefits((p) => p.filter((x) => x !== b))}>
              {b}
            </Chip>
          ))}
        </View>

        <Divider style={styles.divider} />

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
          style={styles.submitButton}
          contentStyle={styles.submitContent}
          labelStyle={styles.submitLabel}
        >
          {loading ? 'Posting…' : 'Post Job'}
        </Button>

        {error && (
          <HelperText type="error" visible style={styles.submitError}>
            {error}
          </HelperText>
        )}
      </Surface>

      <Snackbar
        visible={success}
        onDismiss={() => setSuccess(false)}
        duration={1500}
      >
        Job created successfully!
      </Snackbar>
    </ScrollView>
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
  },
  heading: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subheading: {
    color: '#666',
    marginBottom: 8,
  },
  sectionLabel: {
    fontWeight: '700',
    marginBottom: 8,
  },
  fieldLabel: {
    color: '#555',
    marginBottom: 4,
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  segmented: {
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    marginBottom: 4,
  },
  submitButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  submitContent: {
    paddingVertical: 6,
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  submitError: {
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
