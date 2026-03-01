import { Container, Typography, Paper, Box, Divider } from '@mui/material';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Weir Here Staffing',
};

const directors = [
  { name: 'Jordan Mitchell', title: 'Co-Founder & Managing Director' },
  { name: 'Taylor Reeves', title: 'Co-Founder & Director of Operations' },
  { name: 'Casey Nguyen', title: 'Director of Talent Acquisition' },
];

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        About Us
      </Typography>

      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Who We Are
        </Typography>
        <Typography variant="body1" paragraph>
          Weir Here Staffing is a full-service staffing and workforce solutions agency
          dedicated to bridging the gap between exceptional talent and the companies that
          need them. Founded with a people-first philosophy, we believe that the right
          match transforms businesses and careers alike.
        </Typography>
        <Typography variant="body1" paragraph>
          From temporary placements to permanent hires, contract-to-hire arrangements to
          executive search, our team brings decades of combined recruitment experience
          across IT, Healthcare, Finance, Manufacturing, and more. We pride ourselves on
          taking the time to understand each client&apos;s culture and each
          candidate&apos;s aspirations so every placement is a lasting success.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1" paragraph>
          To empower organizations with the talent they need to thrive and to help
          professionals find careers where they can make a real impact. We are committed
          to integrity, transparency, and delivering measurable results for every
          engagement.
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Leadership
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {directors.map((d) => (
          <Box key={d.name} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {d.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {d.title}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Container>
  );
}
