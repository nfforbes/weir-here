import { Box } from '@mui/material';
import MyJobsList from '@/components/jobs/MyJobsList';

export default function AdminMyJobsPage() {
  return (
    <Box sx={{ py: 6, maxWidth: 800 }}>
      <MyJobsList />
    </Box>
  );
}
