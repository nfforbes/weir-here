import { Container, Typography, Box, Paper } from '@mui/material';

const industries = [
  'Technology & IT',
  'Finance & Banking',
  'Healthcare',
  'Engineering',
  'Manufacturing',
  'Retail & Hospitality',
  'Mining & Resources',
  'Logistics & Supply Chain',
  'Education',
  'Government & Public Sector',
];

export default function IndustriesPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight={700}>
        Industries We Serve
      </Typography>
      <Typography variant="body1" sx={{ mb: 5 }}>
        Weir Here has deep expertise across a broad range of industries, allowing us to provide
        specialised staffing solutions no matter your sector.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {industries.map((ind) => (
          <Paper
            key={ind}
            sx={{
              px: 3,
              py: 2,
              borderRadius: 2,
              flex: '1 1 200px',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            {ind}
          </Paper>
        ))}
      </Box>
    </Container>
  );
}
