'use client';

import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Chip,
  Stack,
  Typography,
  Divider,
  Paper,
  Checkbox,
  FormControlLabel,
  IconButton,
  RadioGroup,
  Radio,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useAppDispatch, useAppSelector } from '@/store';
import { createJob } from '@/store/slices/jobsSlice';
import type { EmploymentType, IScreeningQuestion } from '@weir-here/shared';
import LocationAutocomplete from '@/components/jobs/LocationAutocomplete';

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
];

const CURRENCIES = ['JMD', 'USD', 'EUR', 'GBP', 'CAD'] as const;

const CATEGORY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Other',
];

function emptyQuestion(): IScreeningQuestion {
  return { id: crypto.randomUUID(), question: '', type: 'text', required: false };
}

export default function JobPostForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.jobs);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full-time');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [howToApply, setHowToApply] = useState('');
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [currency, setCurrency] = useState('JMD');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [screeningQuestions, setScreeningQuestions] = useState<IScreeningQuestion[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState('');
  const [reviewerEmails, setReviewerEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isRemote) setLocation('Remote');
  }, [isRemote]);

  const addChip = useCallback(
    (
      value: string,
      setter: React.Dispatch<React.SetStateAction<string[]>>,
      inputSetter: React.Dispatch<React.SetStateAction<string>>,
    ) => {
      const trimmed = value.trim();
      if (trimmed) {
        setter((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
        inputSetter('');
      }
    },
    [],
  );

  const removeChip = useCallback(
    (
      value: string,
      setter: React.Dispatch<React.SetStateAction<string[]>>,
    ) => {
      setter((prev) => prev.filter((v) => v !== value));
    },
    [],
  );

  const addQuestion = useCallback(() => {
    setScreeningQuestions((prev) => [...prev, emptyQuestion()]);
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setScreeningQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const updateQuestion = useCallback(
    (id: string, patch: Partial<IScreeningQuestion>) => {
      setScreeningQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
      );
    },
    [],
  );

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!location.trim()) errs.location = 'Location is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!responsibilities.trim()) errs.responsibilities = 'Responsibilities are required';
    if (!requirements.trim()) errs.requirements = 'Requirements are required';
    if (!howToApply.trim()) errs.howToApply = 'How to apply is required';
    if (salaryMin === '' || salaryMin < 0) errs.salaryMin = 'Valid minimum salary is required';
    if (salaryMax === '' || salaryMax < 0) errs.salaryMax = 'Valid maximum salary is required';
    if (salaryMin !== '' && salaryMax !== '' && salaryMin > salaryMax)
      errs.salaryMax = 'Max salary must be ≥ min salary';
    if (categories.length === 0) errs.categories = 'At least one category is required';
    if (!expiresAt) errs.expiresAt = 'Expiration date is required';
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  }, [
    title, location, description, responsibilities, requirements,
    howToApply, salaryMin, salaryMax, categories, expiresAt,
  ]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      dispatch(
        createJob({
          title: title.trim(),
          location: location.trim(),
          employmentType,
          description: description.trim(),
          responsibilities: responsibilities.trim(),
          requirements: requirements.trim(),
          howToApply: howToApply.trim(),
          salaryRange: {
            min: Number(salaryMin),
            max: Number(salaryMax),
            currency,
          },
          categories,
          tags,
          expiresAt,
          screeningQuestions,
          skills,
          benefits,
          reviewerEmails,
        }),
      );

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/my-jobs'), 1500);
    },
    [
      validate, dispatch, title, location, employmentType, description,
      responsibilities, requirements, howToApply, salaryMin, salaryMax,
      currency, categories, tags, expiresAt, screeningQuestions, skills,
      benefits, reviewerEmails, router,
    ],
  );

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Post a New Job
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Job created! Redirecting…
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* ── Basic Info ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Basic Information
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Job Title"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!validationErrors.title}
            helperText={validationErrors.title}
          />

          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ flex: '2 1 0', minWidth: 0 }}>
              <LocationAutocomplete
                label="Location"
                required
                fullWidth
                value={location}
                onChange={setLocation}
                disabled={isRemote}
                error={!!validationErrors.location}
                helperText={validationErrors.location}
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                />
              }
              label="Remote"
              sx={{ whiteSpace: 'nowrap' }}
            />
          </Stack>

          <TextField
            select
            label="Employment Type"
            required
            fullWidth
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
          >
            {EMPLOYMENT_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* ── Descriptions ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Details
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Description"
            required
            fullWidth
            multiline
            minRows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!validationErrors.description}
            helperText={validationErrors.description}
          />
          <TextField
            label="Responsibilities"
            required
            fullWidth
            multiline
            minRows={3}
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            error={!!validationErrors.responsibilities}
            helperText={validationErrors.responsibilities}
          />
          <TextField
            label="Requirements"
            required
            fullWidth
            multiline
            minRows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            error={!!validationErrors.requirements}
            helperText={validationErrors.requirements}
          />
          <TextField
            label="How to Apply"
            required
            fullWidth
            placeholder="URL, email, or in-platform"
            value={howToApply}
            onChange={(e) => setHowToApply(e.target.value)}
            error={!!validationErrors.howToApply}
            helperText={validationErrors.howToApply}
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* ── Salary ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Compensation
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Min Salary"
            required
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))}
            error={!!validationErrors.salaryMin}
            helperText={validationErrors.salaryMin}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Max Salary"
            required
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))}
            error={!!validationErrors.salaryMax}
            helperText={validationErrors.salaryMax}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            sx={{ minWidth: 110 }}
          >
            {CURRENCIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* ── Categories & Tags ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Classification
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            select
            label="Categories"
            required
            fullWidth
            SelectProps={{ multiple: true }}
            value={categories}
            onChange={(e) => setCategories(e.target.value as unknown as string[])}
            error={!!validationErrors.categories}
            helperText={validationErrors.categories || 'Select one or more categories'}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <TextField
              label="Tags"
              placeholder="Type and press Enter"
              fullWidth
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addChip(tagInput, setTags, setTagInput);
                }
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              {tags.map((t) => (
                <Chip key={t} label={t} size="small" onDelete={() => removeChip(t, setTags)} />
              ))}
            </Stack>
          </Box>

          <TextField
            label="Expiration Date"
            required
            type="date"
            fullWidth
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!validationErrors.expiresAt}
            helperText={validationErrors.expiresAt}
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* ── Screening Questions ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Screening Questions (optional)
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          {screeningQuestions.map((q, idx) => (
            <Paper key={q.id} variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Question {idx + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => removeQuestion(q.id)}>
                    <RemoveCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <TextField
                  label="Question"
                  fullWidth
                  size="small"
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                />
                <RadioGroup
                  row
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(q.id, {
                      type: e.target.value as 'yes_no' | 'text',
                    })
                  }
                >
                  <FormControlLabel value="yes_no" control={<Radio size="small" />} label="Yes / No" />
                  <FormControlLabel value="text" control={<Radio size="small" />} label="Text" />
                </RadioGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={q.required}
                      onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                    />
                  }
                  label="Required"
                />
              </Stack>
            </Paper>
          ))}
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={addQuestion}
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Question
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* ── Optional chip fields ── */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Additional Details (optional)
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          {/* Skills */}
          <Box>
            <TextField
              label="Skills"
              placeholder="Type and press Enter"
              fullWidth
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addChip(skillInput, setSkills, setSkillInput);
                }
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              {skills.map((s) => (
                <Chip key={s} label={s} size="small" onDelete={() => removeChip(s, setSkills)} />
              ))}
            </Stack>
          </Box>

          {/* Benefits */}
          <Box>
            <TextField
              label="Benefits"
              placeholder="Type and press Enter"
              fullWidth
              value={benefitInput}
              onChange={(e) => setBenefitInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addChip(benefitInput, setBenefits, setBenefitInput);
                }
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              {benefits.map((b) => (
                <Chip key={b} label={b} size="small" onDelete={() => removeChip(b, setBenefits)} />
              ))}
            </Stack>
          </Box>

          {/* Reviewer Emails */}
          <Box>
            <TextField
              label="Reviewer Emails"
              placeholder="Type email and press Enter"
              fullWidth
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addChip(emailInput, setReviewerEmails, setEmailInput);
                }
              }}
            />
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              {reviewerEmails.map((em) => (
                <Chip
                  key={em}
                  label={em}
                  size="small"
                  onDelete={() => removeChip(em, setReviewerEmails)}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
          sx={{ minWidth: 180 }}
        >
          {loading ? 'Posting…' : 'Post Job'}
        </Button>
      </Box>
    </Paper>
  );
}
