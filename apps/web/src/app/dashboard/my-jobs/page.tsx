'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJobs } from '@/store/slices/jobsSlice';
import { toUserErrorMessage } from '@/lib/errorMessage';

function jobStatus(expiresAt?: string): 'active' | 'expired' {
  if (!expiresAt) return 'active';
  return new Date(expiresAt) > new Date() ? 'active' : 'expired';
}

export default function MyJobsPage() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { jobs, loading, error } = useAppSelector((state) => state.jobs);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?returnTo=/dashboard/my-jobs');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      dispatch(fetchJobs());
    }
  }, [user, dispatch]);

  if (authLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Posted Jobs
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {toUserErrorMessage(error, 'Failed to load jobs')}
        </Alert>
      )}

      {!loading && jobs.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4 }}>
          You haven&apos;t posted any jobs yet.
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {jobs.map((job) => {
          const status = jobStatus(job.expiresAt);
          return (
            <Card key={job._id}>
              <CardActionArea
                onClick={() => router.push(`/dashboard/my-jobs/${job._id}`)}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.location} &middot; {job.employmentType}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={status}
                      size="small"
                      color={status === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Container>
  );
}
