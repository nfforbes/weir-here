'use client';

import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';

interface CompanySummary {
  _id: string;
  name: string;
  industry: string;
}

export default function TalentDashboard({ companies }: { companies: CompanySummary[] }) {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          My Companies
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href="/dashboard/talent/register-company"
        >
          Register Company
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3 }}>
        <List>
          {companies.map((c) => (
            <ListItemButton key={c._id} component={Link} href={`/dashboard/talent/${c._id}/jobs`}>
              <ListItemText primary={c.name} secondary={c.industry} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Button variant="outlined" component={Link} href="/dashboard/talent/create-job">
          Create New Job Posting
        </Button>
      </Box>
    </Container>
  );
}
