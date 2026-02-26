'use client';

import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';

interface JobSummary {
  _id: string;
  companyId: string;
  companyName: string;
  title: string;
  location: string;
  status: string;
  employmentType: string;
  createdAt: string;
  isCreator: boolean;
}

interface Props {
  jobs: JobSummary[];
}

export default function PostingsClient({ jobs }: Props) {
  const statusColor = (s: string) => {
    if (s === 'published') return 'success';
    if (s === 'closed') return 'error';
    return 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          My Postings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href="/dashboard/talent/create-job"
        >
          New Job
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
        Jobs you created or can review as a reviewer.
      </Typography>

      {jobs.length === 0 ? (
        <Typography color="text.secondary">No job postings yet.</Typography>
      ) : (
        <Paper sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((j) => (
                <TableRow key={j._id}>
                  <TableCell>{j.title}</TableCell>
                  <TableCell>{j.companyName}</TableCell>
                  <TableCell>{j.location}</TableCell>
                  <TableCell>{j.employmentType}</TableCell>
                  <TableCell>
                    <Chip
                      label={j.status}
                      size="small"
                      color={statusColor(j.status) as 'success' | 'error' | 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={j.isCreator ? 'Creator' : 'Reviewer'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{new Date(j.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      component={Link}
                      href={`/dashboard/talent/${j.companyId}/jobs/${j._id}/applications`}
                    >
                      View Applicants
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
