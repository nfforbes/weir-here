import { Container, Typography, Box, Paper } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedIcon from '@mui/icons-material/Verified';

export default function ForEmployersPage() {
  const benefits = [
    {
      icon: <BusinessCenterIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Pre-Screened Candidates',
      text: 'We rigorously vet every candidate so you only meet qualified professionals.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Fast Turnaround',
      text: 'Our extensive talent pool means we can fill positions quickly and efficiently.',
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Quality Guarantee',
      text: 'If a placement does not work out, we will find you a replacement at no extra cost.',
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight={700}>
        For Employers
      </Typography>
      <Typography variant="body1" sx={{ mb: 5 }}>
        Finding the right talent should not slow your business down. Weir Here provides staffing
        solutions tailored to your industry, culture, and budget.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {benefits.map((b) => (
          <Paper key={b.title} sx={{ flex: '1 1 250px', p: 4, borderRadius: 3, textAlign: 'center' }}>
            {b.icon}
            <Typography variant="h6" sx={{ mt: 2 }}>
              {b.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {b.text}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}
