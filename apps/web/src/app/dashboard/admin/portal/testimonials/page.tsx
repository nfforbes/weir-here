'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppSelector } from '@/store';
import AdminTestimonialsManager from '@/components/admin/AdminTestimonialsManager';

export default function AdminTestimonialsPage() {
  const { user, isLoading: authLoading } = useUser();
  const authUser = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?returnTo=/dashboard/admin/testimonials');
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
    <Box sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Testimonials
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Control what appears on the public Testimonials page. Drafts stay hidden until you publish them.
      </Typography>
      <AdminTestimonialsManager />
    </Box>
  );
}
