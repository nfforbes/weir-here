'use client';

import { Box } from '@mui/material';
import JobPostForm from '@/components/jobs/JobPostForm';

export default function AdminPostJobPage() {
  return (
    <Box sx={{ py: 6, maxWidth: 900, mx: 'auto', width: '100%' }}>
      <JobPostForm />
    </Box>
  );
}
