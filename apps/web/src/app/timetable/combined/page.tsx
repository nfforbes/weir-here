import { Container, Typography } from '@mui/material';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Combined timetable',
};

/** Placeholder: previous draft referenced missing DB helpers; rebuild when timetable is integrated. */
export default function CombinedTimetablePlaceholder() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h5" gutterBottom>
        Combined timetable
      </Typography>
      <Typography color="text.secondary">
        This page is not wired to the timetable data model yet.
      </Typography>
    </Container>
  );
}
