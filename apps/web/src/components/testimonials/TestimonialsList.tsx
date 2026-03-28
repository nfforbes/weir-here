'use client';

import { Typography, Paper, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import type { PublicTestimonial } from '@/lib/testimonialQueries';
import TestimonialAvatar from '@/components/testimonials/TestimonialAvatar';

const GOLD = '#cfaf5b';

function normalize(t: PublicTestimonial): PublicTestimonial {
  return {
    id: String(t.id ?? ''),
    quote: String(t.quote ?? ''),
    authorName: String(t.authorName ?? '').trim() || 'Anonymous',
    authorTitle: String(t.authorTitle ?? ''),
    context: String(t.context ?? ''),
    avatarUrl: String(t.avatarUrl ?? ''),
  };
}

type Props = {
  testimonials: PublicTestimonial[];
};

export default function TestimonialsList({ testimonials }: Props) {
  const rows = testimonials.map(normalize).filter((t) => t.id && t.quote);

  if (rows.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
        We are gathering new testimonials. Please check back soon.
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {rows.map((t) => (
        <Grid key={t.id} size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderTop: '4px solid',
              borderColor: GOLD,
            }}
          >
            <FormatQuoteIcon sx={{ color: GOLD, fontSize: 36, mb: 1, opacity: 0.9 }} aria-hidden />
            <Typography variant="body1" sx={{ flex: 1, lineHeight: 1.75, fontStyle: 'italic', color: 'text.primary' }}>
              “{t.quote}”
            </Typography>
            <Box
              sx={{
                mt: 2.5,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <TestimonialAvatar src={t.avatarUrl} name={t.authorName} />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {t.authorName}
                </Typography>
                {[t.authorTitle, t.context].filter(Boolean).length > 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {[t.authorTitle, t.context].filter(Boolean).join(' · ')}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
