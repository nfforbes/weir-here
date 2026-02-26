'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert,
  TextField,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
} from '@mui/material';

interface ScreeningQuestion {
  question: string;
  type: 'yesno' | 'text';
}

export default function ApplyClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();
        setJobTitle(data.job.title);
        setScreeningQuestions(data.job.screeningQuestions || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  const handleSubmit = async () => {
    if (!resumeFile) {
      setError('Please upload your resume');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('file', resumeFile);
      fd.append('target', 'resume');
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!uploadRes.ok) throw new Error('Failed to upload resume');
      const { url: resumeUrl } = await uploadRes.json();

      const screeningAnswers = screeningQuestions.map((q, i) => ({
        question: q.question,
        answer: answers[i] || '',
      }));

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, resumeUrl, screeningAnswers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Your application has been submitted successfully!
        </Alert>
        <Button variant="contained" onClick={() => router.push('/jobs')}>
          Back to Job Board
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Apply for: {jobTitle}
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Upload Resume *
            </Typography>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
          </Box>

          {screeningQuestions.map((q, i) => (
            <Box key={i}>
              <FormLabel>{q.question}</FormLabel>
              {q.type === 'yesno' ? (
                <RadioGroup
                  value={answers[i] || ''}
                  onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                  row
                >
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={answers[i] || ''}
                  onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                  multiline
                  rows={2}
                />
              )}
            </Box>
          ))}

          {error && <Alert severity="error">{error}</Alert>}

          <Button variant="contained" size="large" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
