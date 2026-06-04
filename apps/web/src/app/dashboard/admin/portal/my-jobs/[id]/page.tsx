import { Box } from '@mui/material';
import MyJobDetail from '@/components/jobs/MyJobDetail';

export default function AdminMyJobDetailPage() {
  return (
    <Box sx={{ py: 6, maxWidth: 900, mx: 'auto', width: '100%' }}>
      <MyJobDetail />
    </Box>
  );
}
