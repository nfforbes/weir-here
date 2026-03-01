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
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Job Seekers | Weir Here Staffing',
};

const benefits = [
  'Browse hundreds of openings across multiple industries',
  'Apply in minutes with our streamlined application process',
  'Get matched to roles that fit your skills and career goals',
  'Resume support and interview coaching from our recruiters',
  'Temporary, contract, and permanent opportunities available',
  'Completely free for job seekers — always',
];

export default function JobSeekersPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Find Your Next Opportunity
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 700 }}>
        Your next career move starts here. Weir Here Staffing connects talented
        professionals like you with employers who value your skills and experience.
      </Typography>

      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          What You Get
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
        <Button variant="contained" size="large" component={Link} href="/jobs">
          Browse Open Positions
        </Button>
      </Box>
    </Container>
  );
}
