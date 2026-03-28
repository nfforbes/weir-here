import { Container, Typography } from '@mui/material';
import type { Metadata } from 'next';
import { getPublishedTestimonials } from '@/lib/testimonialQueries';
import TestimonialsList from '@/components/testimonials/TestimonialsList';

/** Always read from MongoDB so administrator edits appear without redeploying. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Testimonials | Weir Here Staffing',
  description:
    'What clients and candidates say about partnering with Weir Here Staffing.',
};

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

      <TestimonialsList testimonials={testimonials} />

      <Typography variant="body2" color="text.secondary" sx={{ mt: 5, maxWidth: 640 }}>
        Testimonials reflect individual experiences and are provided for informational purposes. They are not
        guarantees of future results or staffing outcomes.
      </Typography>
    </Container>
  );
}
