import { Container, Typography, Box, Paper, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Link from 'next/link';

export default function ForJobSeekersPage() {
  const benefits = [
    {
      icon: <SearchIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      title: 'Curated Opportunities',
      text: 'Access exclusive positions with top employers across multiple industries.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      title: 'Career Growth',
      text: 'We match you with roles that align with your skills and long-term career goals.',
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      title: 'Personal Support',
      text: 'Our team guides you through the entire process, from application to first day.',
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight={700}>
        For Job Seekers
      </Typography>
      <Typography variant="body1" sx={{ mb: 5 }}>
        Your next great opportunity is closer than you think. Let us connect you with employers
        who value your skills and experience.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 5 }}>
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
      <Box sx={{ textAlign: 'center' }}>
        <Button variant="contained" size="large" component={Link} href="/jobs">
          Browse Open Positions
        </Button>
      </Box>
    </Container>
  );
}
