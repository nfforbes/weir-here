'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Paper,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAppDispatch, useAppSelector } from '@/store';
import { submitApplication } from '@/store/slices/applicationsSlice';
import type { IJob, IScreeningAnswer } from '@weir-here/shared';
import { toUserErrorMessage } from '@/lib/errorMessage';

interface ApplicationFormProps {
  job: IJob;
}

export default function ApplicationForm({ job }: ApplicationFormProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.applications);

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    job.screeningQuestions.forEach((q) => {
      init[q.id] = '';
    });
    return init;
  });
  const [resume, setResume] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSuccess(false);
    setSubmitPending(false);
  }, [job._id]);

  useEffect(() => {
    if (!submitPending) return;
    if (loading) return;
    if (error) {
      setSubmitPending(false);
      return;
    }
    setSuccess(true);
    setSubmitPending(false);
  }, [submitPending, loading, error]);

  const updateAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (file && file.type !== 'application/pdf') {
        setValidationError('Only PDF files are accepted.');
        setResume(null);
        return;
      }
      setValidationError('');
      setResume(file);
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setValidationError('');

      const unansweredRequired = job.screeningQuestions.filter(
        (q) => q.required && !answers[q.id]?.trim(),
      );
      if (unansweredRequired.length > 0) {
        setValidationError('Please answer all required screening questions.');
        return;
      }
      if (!resume) {
        setValidationError('Please upload your resume (PDF).');
        return;
      }

      const screeningAnswers: IScreeningAnswer[] = job.screeningQuestions.map(
        (q) => ({ questionId: q.id, answer: answers[q.id] ?? '' }),
      );

      const formData = new FormData();
      formData.append('jobId', job._id ?? '');
      formData.append('answers', JSON.stringify(screeningAnswers));
      formData.append('resume', resume);

      setSubmitPending(true);
      dispatch(submitApplication(formData));
    },
    [answers, resume, job, dispatch],
  );

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Apply for {job.title}
      </Typography>

      {success && !error && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Application submitted successfully!
        </Alert>
      )}
      {(error || validationError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError || toUserErrorMessage(error, 'Something went wrong')}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {job.screeningQuestions.length > 0 && (
          <Stack spacing={3} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Screening Questions
            </Typography>

            {job.screeningQuestions.map((q) => (
              <Box key={q.id}>
                <FormLabel required={q.required} sx={{ display: 'block', mb: 0.5 }}>
                  {q.question}
                </FormLabel>

                {q.type === 'yes_no' ? (
                  <RadioGroup
                    row
                    value={answers[q.id] ?? ''}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                  >
                    <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    value={answers[q.id] ?? ''}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                  />
                )}
              </Box>
            ))}
          </Stack>
        )}

        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Resume
          </Typography>

          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            {resume ? resume.name : 'Upload PDF'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={handleFileChange}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || success}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
            sx={{ mt: 2, minWidth: 160 }}
          >
            {loading ? 'Submitting…' : 'Submit Application'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
