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
     

      <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: '#4a4a4a', color: '#cfaf5b' }}>
       <Typography variant="h4" fontWeight={500} gutterBottom>
        About Us - Weir Here Staffing
        </Typography>
        <Divider sx={{ mb: 3, borderColor: 'black' }} />
        <Typography variant="body1" paragraph>
        At Weir Here Staffing, we believe that exceptional care begins with exceptional people. We are committed to strengthening communities by connecting qualified, compassionate healthcare professionals with the facilities, families, and organizations that need them most.

        We are more than a staffing agency, we are a dedicated partner built on integrity and personalized service. Whether supporting a hospital, long-term care facility, private home, or childcare environment, Weir Here Staffing ensures every placement contributes to safer care, smoother operations, and better outcomes. *When you need us, Weir Here.*

        </Typography>       
      </Paper>

      

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={300} gutterBottom>
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
