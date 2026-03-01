import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Grid2 as Grid,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solutions | Weir Here Staffing',
};

const solutions = [
  {
    title: 'For Employers',
    description:
      'Streamline your hiring process with our full-service staffing solutions. From temporary placements to executive search, we find the right people fast.',
    href: '/solutions/employers',
    icon: BusinessIcon,
  },
  {
    title: 'For Job Seekers',
    description:
      'Discover your next career opportunity. We connect skilled professionals with leading companies across a range of industries.',
    href: '/solutions/job-seekers',
    icon: PersonSearchIcon,
  },
];

export default function SolutionsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Our Solutions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
        Whether you&apos;re looking to build your workforce or advance your career,
        Weir Here Staffing has a tailored solution for you.
      </Typography>

      <Grid container spacing={4}>
        {solutions.map((s) => (
          <Grid key={s.title} size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
              }}
            >
              <CardActionArea
                component={Link}
                href={s.href}
                sx={{ height: '100%', p: 3 }}
              >
                <Box sx={{ mb: 2 }}>
                  <s.icon sx={{ fontSize: 56, color: 'primary.main' }} />
                </Box>
                <CardContent sx={{ px: 0 }}>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {s.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {s.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
