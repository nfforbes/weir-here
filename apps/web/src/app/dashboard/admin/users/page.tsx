'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppSelector } from '@/store';
import AdminUsersManager from '@/components/admin/AdminUsersManager';

export default function AdminUsersPage() {
  const { user, isLoading: authLoading } = useUser();
  const authUser = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?returnTo=/dashboard/admin/users');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authUser && !authUser.personas.includes('administrator')) {
      router.replace('/dashboard');
    }
  }, [authUser, router]);

  if (authLoading || !user || !authUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authUser.personas.includes('administrator')) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Users
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Assign roles and remove application profiles. New visitors receive the User role when they first sign in.
        To block someone completely, revoke access in Auth0 as well.
      </Typography>
      <AdminUsersManager currentAuth0Id={authUser.auth0Id} />
    </Container>
  );
}
