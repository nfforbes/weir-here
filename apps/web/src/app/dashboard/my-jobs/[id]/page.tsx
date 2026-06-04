import { Container } from '@mui/material';
import MyJobDetail from '@/components/jobs/MyJobDetail';

export default function MyJobDetailPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <MyJobDetail />
    </Container>
  );
}
