'use client';

import { Box, Container, Typography, Paper } from '@mui/material';
import Link from 'next/link';
import GroupsIcon from '@mui/icons-material/Groups';
import WorkIcon from '@mui/icons-material/Work';

interface Props {
  isLoggedIn: boolean;
}

export default function HomePage({ isLoggedIn }: Props) {
  const talentHref = isLoggedIn ? '/dashboard/talent' : '/auth/login?returnTo=/dashboard/talent';
  const careerHref = '/jobs';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom fontWeight={700}>
        Welcome to Weir Here
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
        Your trusted staffing partner. Whether you need to find top talent or land your next career,
        we have you covered.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 4,
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        <Paper
          component={Link}
          href={talentHref}
          elevation={4}
          sx={{
            flex: 1,
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            aspectRatio: '1/1',
            maxWidth: 320,
            mx: 'auto',
            borderRadius: 4,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 8,
            },
          }}
        >
          <GroupsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600}>
            I Need Talent
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Find qualified candidates for your open positions
          </Typography>
        </Paper>

        <Paper
          component={Link}
          href={careerHref}
          elevation={4}
          sx={{
            flex: 1,
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            aspectRatio: '1/1',
            maxWidth: 320,
            mx: 'auto',
            borderRadius: 4,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 8,
            },
          }}
        >
          <WorkIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600}>
            I Need a Career
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Browse open positions and apply today
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
