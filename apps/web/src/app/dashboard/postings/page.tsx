'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Button,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppSelector } from '@/store';
import { hasPermission, IJob, PERMISSIONS } from '@weir-here/shared';
import { toUserErrorMessage } from '@/lib/errorMessage';

function jobStatus(expiresAt?: string | null): 'active' | 'expired' {
  if (!expiresAt) return 'active';
  return new Date(expiresAt) > new Date() ? 'active' : 'expired';
}

const employmentTypeLabels: Record<string, string> = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  contract: 'Contract',
  temporary: 'Temporary',
  internship: 'Internship',
};

export default function PostingsPage() {
  const { user, isLoading: authLoading } = useUser();
  const authUser = useAppSelector((state) => state.auth.user);
  const canPostJob =
    authUser != null && hasPermission(authUser.personas, PERMISSIONS.POST_JOB);
  const router = useRouter();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?returnTo=/dashboard/postings');
      return;
    }
    if (!user) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch('/api/jobs?mine=true&limit=100')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load postings');
        return res.json();
      })
      .then((data: { jobs?: IJob[] }) => {
        if (!cancelled) {
          setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(toUserErrorMessage(err, 'Failed to load postings'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  if (authLoading || !user || (user && !authUser)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Job Postings
        </Typography>
        <Button
          component={Link}
          href="/dashboard/post-job"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: 'none' }}
        >
          Post a job
        </Button>
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View and manage your job postings below.
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {toUserErrorMessage(error, 'Failed to load postings')}
        </Alert>
      )}

      {!loading && !error && jobs.length === 0 && (
        <Card variant="outlined" sx={{ py: 6 }}>
          <CardContent>
            <Typography color="text.secondary" align="center" gutterBottom>
              {canPostJob
                ? "You don't have any job postings yet."
                : 'Only administrators can create job postings. Contact your admin if you need a role posted.'}
            </Typography>
            {canPostJob && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  component={Link}
                  href="/dashboard/post-job"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Post your first job
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && jobs.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {jobs.map((job) => {
            const status = jobStatus(job.expiresAt);
            const postedDate = job.createdAt
              ? new Date(job.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null;
            return (
              <Card key={job._id} variant="outlined">
                <CardActionArea
                  onClick={() => router.push(`/dashboard/my-jobs/${job._id}`)}
                  sx={{ display: 'block' }}
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
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {job.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {job.location}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          &middot;
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {employmentTypeLabels[job.employmentType] ?? job.employmentType}
                        </Typography>
                        {postedDate && (
                          <>
                            <Typography variant="body2" color="text.secondary">
                              &middot;
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              Posted {postedDate}
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </Box>
                    <Chip
                      label={status}
                      size="small"
                      color={status === 'active' ? 'success' : 'default'}
                    />
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
}
