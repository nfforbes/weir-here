'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJob, clearCurrentJob } from '@/store/slices/jobsSlice';
import ApplicationForm from '@/components/jobs/ApplicationForm';
import { toUserErrorMessage } from '@/lib/errorMessage';

export default function JobApplyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useUser();
  const { currentJob: job, loading, error } = useAppSelector((state) => state.jobs);

  useEffect(() => {
    if (id) dispatch(fetchJob(id));
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (!authLoading && !user && id) {
      router.replace(`/auth/login?returnTo=/jobs/${encodeURIComponent(id)}/apply`);
    }
  }, [authLoading, user, router, id]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{toUserErrorMessage(error, 'Failed to load job')}</Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography>Job not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`/jobs/${id}`)}
        sx={{ mb: 3 }}
      >
        Back to job
      </Button>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Apply for this role
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {job.title}
        {job.location ? ` · ${job.location}` : ''}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <ApplicationForm job={job} />
      </Box>
    </Container>
  );
}
