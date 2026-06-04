import { Container } from '@mui/material';
import MyJobEdit from '@/components/jobs/MyJobEdit';

export default function EditMyJobPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <MyJobEdit />
    </Container>
  );
}
