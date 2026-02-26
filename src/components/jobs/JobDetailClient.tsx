'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';

interface JobDetail {
  _id: string;
  title: string;
  location: string;
  employmentType: string;
  description: string;
  responsibilities: string;
  requirements: string;
  howToApply: string;
  salaryRange?: { min?: number; max?: number; currency?: string };
  categories: string[];
  tags: string[];
  skills: string[];
  benefits: string[];
  screeningQuestions: { question: string; type: string }[];
  company?: {
    name: string;
    website?: string;
    industry?: string;
    contactPerson?: { name: string; email: string };
  };
  createdAt: string;
}

export default function JobDetailClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data.job);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job');
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error || 'Job not found'}</Alert>
      </Container>
    );
  }

  const applyHref = user
    ? `/jobs/${jobId}/apply`
    : `/auth/login?returnTo=/jobs/${jobId}/apply`;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button component={Link} href="/jobs" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
        Back to Job Board
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {job.title}
        </Typography>

        {job.company && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {job.company.name}
            {job.company.industry && ` · ${job.company.industry}`}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          <Chip label={job.location} />
          <Chip label={job.employmentType} color="primary" variant="outlined" />
          {job.salaryRange?.min && (
            <Chip
              label={`${job.salaryRange.currency || 'USD'} ${job.salaryRange.min.toLocaleString()}${job.salaryRange.max ? ` - ${job.salaryRange.max.toLocaleString()}` : '+'}`}
              color="success"
              variant="outlined"
            />
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {job.description}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Responsibilities
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {job.responsibilities}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Requirements
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {job.requirements}
        </Typography>

        {job.skills.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {job.skills.map((s) => (
                <Chip key={s} label={s} size="small" />
              ))}
            </Box>
          </>
        )}

        {job.benefits.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Benefits
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {job.benefits.map((b) => (
                <Chip key={b} label={b} size="small" color="secondary" variant="outlined" />
              ))}
            </Box>
          </>
        )}

        {job.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {job.tags.map((t) => (
              <Chip key={t} label={`#${t}`} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          How to Apply
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {job.howToApply}
        </Typography>

        {!user && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You must be logged in to apply for this position.
          </Alert>
        )}

        <Button variant="contained" size="large" component={Link} href={applyHref} fullWidth>
          Apply Now
        </Button>
      </Paper>
    </Container>
  );
}
