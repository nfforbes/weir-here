'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, CircularProgress, Stack } from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppSelector } from '@/store';
import MS365SettingsForm from '@/components/admin/MS365SettingsForm';
import SMTPSettingsForm from '@/components/admin/SMTPSettingsForm';

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading } = useUser();
  const authUser = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?returnTo=/dashboard/admin/settings');
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
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Admin Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure Microsoft 365 integration, SMTP email settings, and other system settings.
      </Typography>
      <Stack spacing={4}>
        <MS365SettingsForm />
        <SMTPSettingsForm />
      </Stack>
    </Container>
  );
}
