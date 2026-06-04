import { Container } from '@mui/material';
import MyJobsList from '@/components/jobs/MyJobsList';

export default function MyJobsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <MyJobsList />
    </Container>
  );
}
