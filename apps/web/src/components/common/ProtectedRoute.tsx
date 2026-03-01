'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
        <Alert severity="error">
          An authentication error occurred. Please try again.
        </Alert>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  if (user.email_verified === false) {
    return (
      <Box sx={{ p: 4, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Email Verification Required
        </Typography>
        <Typography color="text.secondary">
          Please check your inbox and verify your email address before continuing.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
