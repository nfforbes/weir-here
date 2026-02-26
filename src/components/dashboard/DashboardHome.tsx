'use client';

import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import Link from 'next/link';
import GroupsIcon from '@mui/icons-material/Groups';
import WorkIcon from '@mui/icons-material/Work';
import type { AppUser } from '@/lib/auth';

export default function DashboardHome({ user }: { user: AppUser }) {
  if (!user.emailVerified) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please verify your email address before proceeding. Check your inbox for a verification
          link from Auth0.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Welcome back, {user.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
        What would you like to do today?
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 4,
          justifyContent: 'center',
        }}
      >
        <Paper
          component={Link}
          href="/dashboard/talent"
          elevation={4}
          sx={{
            flex: 1,
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            borderRadius: 4,
            maxWidth: 320,
            mx: 'auto',
            aspectRatio: '1/1',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
          }}
        >
          <GroupsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600}>
            I Need Talent
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Post jobs and review applicants
          </Typography>
        </Paper>

        <Paper
          component={Link}
          href="/jobs"
          elevation={4}
          sx={{
            flex: 1,
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            borderRadius: 4,
            maxWidth: 320,
            mx: 'auto',
            aspectRatio: '1/1',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
          }}
        >
          <WorkIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600}>
            I Need a Career
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Browse and apply for jobs
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
