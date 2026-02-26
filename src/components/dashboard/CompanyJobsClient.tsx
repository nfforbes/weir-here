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
  title: string;
  location: string;
  status: string;
  employmentType: string;
  createdAt: string;
}

interface Props {
  companyName: string;
  companyId: string;
  jobs: JobSummary[];
}

export default function CompanyJobsClient({ companyName, companyId, jobs }: Props) {
  const statusColor = (s: string) => {
    if (s === 'published') return 'success';
    if (s === 'closed') return 'error';
    return 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {companyName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Job Postings
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} component={Link} href="/dashboard/talent/create-job">
          New Job
        </Button>
      </Box>

      {jobs.length === 0 ? (
        <Typography color="text.secondary">No job postings yet.</Typography>
      ) : (
        <Paper sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((j) => (
                <TableRow key={j._id}>
                  <TableCell>{j.title}</TableCell>
                  <TableCell>{j.location}</TableCell>
                  <TableCell>{j.employmentType}</TableCell>
                  <TableCell>
                    <Chip label={j.status} size="small" color={statusColor(j.status) as 'success' | 'error' | 'default'} />
                  </TableCell>
                  <TableCell>{new Date(j.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" component={Link} href={`/dashboard/talent/${companyId}/jobs/${j._id}/applications`}>
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
