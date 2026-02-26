import { Container, Typography } from '@mui/material';

export default function PrivacyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight={700}>
        Privacy and Security
      </Typography>
      <Typography variant="body1">
        Weir Here takes your privacy seriously. We collect and process personal data only as
        necessary to provide our staffing services. Your information is stored securely and is
        never shared with third parties without your consent, except as required by law.
      </Typography>
    </Container>
  );
}
