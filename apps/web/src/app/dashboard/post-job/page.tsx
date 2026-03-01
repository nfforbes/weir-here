'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';
import JobPostForm from '@/components/jobs/JobPostForm';

export default function PostJobPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login?returnTo=/dashboard/post-job');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Post a New Job
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Fill out the form below to create a new job listing.
      </Typography>
      <JobPostForm />
    </Container>
  );
}
