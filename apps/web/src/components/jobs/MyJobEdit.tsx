'use client';

import { useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchJob, clearCurrentJob } from '@/store/slices/jobsSlice';
import JobPostForm from '@/components/jobs/JobPostForm';
import { toUserErrorMessage } from '@/lib/errorMessage';

export default function MyJobEdit() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();

  const isPortal = pathname?.startsWith('/dashboard/admin/portal');
  const basePath = isPortal ? '/dashboard/admin/portal/my-jobs' : '/dashboard/my-jobs';
  const { user, isLoading: authLoading } = useUser();
  const dispatch = useAppDispatch();
  const { currentJob, loading, error } = useAppSelector((state) => state.jobs);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth/login?returnTo=/dashboard/my-jobs/${id}/edit`);
    }
  }, [user, authLoading, router, id]);

  useEffect(() => {
    if (id && user) {
      dispatch(fetchJob(id));
    }
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [id, user, dispatch]);

  if (authLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loading && !currentJob) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !currentJob) {
    return (
      <Box sx={{ py: 8 }}>
        <Alert severity="error">{toUserErrorMessage(error, 'Failed to load job')}</Alert>
      </Box>
    );
  }

  if (!currentJob || String(currentJob._id) !== String(id)) {
    return (
      <Box sx={{ py: 8 }}>
        <Alert severity="warning">Job not found or still loading.</Alert>
      </Box>
    );
  }

  if (user.sub !== currentJob.postedBy) {
    return (
      <Box sx={{ py: 8 }}>
        <Alert severity="error">You can only edit jobs you posted.</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(basePath)}
          sx={{ mt: 2 }}
        >
          Back to My Jobs
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`${basePath}/${id}`)}
        sx={{ mb: 2 }}
      >
        Back to posting
      </Button>
      <JobPostForm job={currentJob} />
    </>
  );
}
