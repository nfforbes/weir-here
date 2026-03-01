'use client';

import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
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

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();

  const handleTalent = () => {
    if (user) {
      router.push('/dashboard/post-job');
    } else {
      router.push('/auth/login?returnTo=/dashboard/post-job');
    }
  };

  const handleCareer = () => {
    router.push('/jobs');
  };

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
      <Typography variant="h3" fontWeight={700} textAlign="center" gutterBottom>
        Welcome to Weir Here Staffing
      </Typography>
      <Typography
        variant="h6"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 6, maxWidth: 600 }}
      >
        Connecting talent with opportunity. How can we help you today?
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
            onClick={handleTalent}
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
                Post a job and find the right candidates
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card sx={CARD_SX}>
          <CardActionArea
            onClick={handleCareer}
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
                Browse open positions and apply today
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
}
