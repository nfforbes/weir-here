'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppSelector } from '@/store';
import { hasPermission, PERMISSIONS } from '@weir-here/shared';
import { ELECTRIC_BLUE } from '@/theme/theme';

const CARD_SX = {
  width: { xs: '100%', sm: 280 },
  height: 280,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: 8,
  },
} as const;

export default function CareersPage() {
  const { user, isLoading } = useUser();
  const authUser = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  const canPostJob =
    authUser != null && hasPermission(authUser.personas, PERMISSIONS.POST_JOB);

  const handlePostJob = () => {
    if (!user) {
      router.push('/auth/login?returnTo=/dashboard/post-job');
      return;
    }
    if (canPostJob) {
      router.push('/dashboard/post-job');
    } else {
      router.push('/contact');
    }
  };

  const handleBrowseJobs = () => {
    router.push('/jobs');
  };

  if (isLoading || (user && !authUser)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        px: 2,
      }}
    >
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {user && authUser?.name ? `Welcome, ${authUser.name}!` : 'Careers'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
        {user
          ? 'What would you like to do today?'
          : 'Explore opportunities or get in touch to hire through Weir Here.'}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
        }}
      >
        <Card sx={CARD_SX}>
          <CardActionArea
            onClick={handlePostJob}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <BusinessCenterIcon sx={{ fontSize: 72, color: ELECTRIC_BLUE, mb: 2 }} />
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={600}>
                I Need Talent
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {!user
                  ? 'Sign in to post a job (administrators only) or contact us to hire.'
                  : canPostJob
                    ? 'Post a new job listing'
                    : 'Contact us to staff your team—only administrators can post jobs.'}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card sx={CARD_SX}>
          <CardActionArea
            onClick={handleBrowseJobs}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <WorkOutlineIcon sx={{ fontSize: 72, color: ELECTRIC_BLUE, mb: 2 }} />
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={600}>
                I Need a Career
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Browse open positions
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
}
