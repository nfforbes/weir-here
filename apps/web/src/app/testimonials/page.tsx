import {
  Container,
  Typography,
  Paper,
  Box,
  Grid2 as Grid,
} from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import type { Metadata } from 'next';
import { getPublishedTestimonials } from '@/lib/testimonialQueries';
import TestimonialAvatar from '@/components/testimonials/TestimonialAvatar';

/** Always read from MongoDB so administrator edits appear without redeploying. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Testimonials | Weir Here Staffing',
  description:
    'What clients and candidates say about partnering with Weir Here Staffing.',
};

const GOLD = '#cfaf5b';

export default async function TestimonialsPage() {
  const testimonials = await getPublishedTestimonials();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Testimonials
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 720 }}>
        We are grateful for the employers, clinicians, and families who choose Weir Here Staffing. Below are
        representative comments about how we show up—your experience may vary, but our standard does not.
      </Typography>

      {testimonials.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
          We are gathering new testimonials. Please check back soon.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {testimonials.map((t) => (
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
                <Typography
                  variant="body1"
                  sx={{ flex: 1, lineHeight: 1.75, fontStyle: 'italic', color: 'text.primary' }}
                >
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
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 5, maxWidth: 640 }}>
        Testimonials reflect individual experiences and are provided for informational purposes. They are not
        guarantees of future results or staffing outcomes.
      </Typography>
    </Container>
  );
}
