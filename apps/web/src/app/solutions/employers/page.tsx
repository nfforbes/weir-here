'use client';

import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';

const benefits = [
  'Access a vetted pool of qualified candidates across industries',
  'Reduce time-to-hire with our streamlined matching process',
  'Flexible staffing models: temporary, contract-to-hire, permanent',
  'Dedicated account managers who understand your business',
  'Screening, interviews, and skills assessments handled for you',
  'No placement fee until you find the right fit',
];

export default function EmployersPage() {
  const { user } = useUser();
  const router = useRouter();

  const handlePostJob = () => {
    if (user) {
      router.push('/dashboard/post-job');
    } else {
      router.push('/auth/login?returnTo=/dashboard/post-job');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Staffing Solutions for Employers
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 700 }}>
        Finding the right talent shouldn&apos;t slow your business down. Weir Here
        Staffing partners with companies of all sizes to deliver workforce solutions that
        scale with your needs.
      </Typography>

      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Why Partner With Us
        </Typography>
        <List disablePadding>
          {benefits.map((b) => (
            <ListItem key={b} disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={b} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Box sx={{ textAlign: 'center' }}>
        <Button variant="contained" size="large" onClick={handlePostJob}>
          Post a Job
        </Button>
      </Box>
    </Container>
  );
}
