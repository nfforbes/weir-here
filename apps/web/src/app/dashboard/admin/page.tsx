'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Stack,
  Button,
} from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppSelector } from '@/store';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useUser();
  const authUser = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?returnTo=/dashboard/admin');
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
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Configuration
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage users, testimonials, and system settings.
      </Typography>
      <Stack spacing={2}>
        <Button
          component={Link}
          href="/dashboard/admin/users"
          variant="outlined"
          size="large"
          startIcon={<GroupIcon />}
          fullWidth
          sx={{ justifyContent: 'flex-start', py: 1.5 }}
        >
          Users
        </Button>
        <Button
          component={Link}
          href="/dashboard/admin/testimonials"
          variant="outlined"
          size="large"
          startIcon={<FormatQuoteIcon />}
          fullWidth
          sx={{ justifyContent: 'flex-start', py: 1.5 }}
        >
          Testimonials
        </Button>
        <Button
          component={Link}
          href="/dashboard/admin/settings"
          variant="outlined"
          size="large"
          startIcon={<SettingsIcon />}
          fullWidth
          sx={{ justifyContent: 'flex-start', py: 1.5 }}
        >
          Settings
        </Button>
      </Stack>
    </Container>
  );
}
