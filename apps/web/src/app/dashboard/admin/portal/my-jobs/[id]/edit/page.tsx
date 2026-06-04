import { Box } from '@mui/material';
import MyJobEdit from '@/components/jobs/MyJobEdit';

export default function AdminEditMyJobPage() {
  return (
    <Box sx={{ py: 6, maxWidth: 900, mx: 'auto', width: '100%' }}>
      <MyJobEdit />
    </Box>
  );
}
