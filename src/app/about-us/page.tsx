import { Container, Typography, Box, Paper, Avatar } from '@mui/material';

const directors = [
  { name: 'Jane Doe', title: 'CEO & Founder', initials: 'JD' },
  { name: 'John Smith', title: 'COO', initials: 'JS' },
  { name: 'Sarah Chen', title: 'CTO', initials: 'SC' },
];

export default function AboutUsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom fontWeight={700}>
        About Us
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Weir Here is a premier staffing agency dedicated to connecting exceptional talent with
        outstanding employers. Founded with a passion for building meaningful professional
        relationships, we specialise in matching the right people with the right opportunities
        across a wide range of industries.
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Our team combines deep industry knowledge with a people-first approach, ensuring every
        placement is a win for both the candidate and the employer. We leverage technology and
        personal relationships to create staffing solutions that work.
      </Typography>

      <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mt: 6 }}>
        Our Directors
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {directors.map((d) => (
          <Paper key={d.name} sx={{ p: 3, flex: '1 1 200px', textAlign: 'center', borderRadius: 3 }}>
            <Avatar sx={{ width: 72, height: 72, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 28 }}>
              {d.initials}
            </Avatar>
            <Typography variant="h6">{d.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {d.title}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}
