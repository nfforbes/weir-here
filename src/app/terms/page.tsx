import { Container, Typography } from '@mui/material';

export default function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight={700}>
        Terms of Use
      </Typography>
      <Typography variant="body1">
        These terms and conditions govern your use of the Weir Here platform. By accessing or using
        our services you agree to be bound by these terms. Please read them carefully before using
        the site.
      </Typography>
    </Container>
  );
}
