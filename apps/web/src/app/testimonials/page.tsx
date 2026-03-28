import type { Metadata } from 'next';
import { getPublishedTestimonials } from '@/lib/testimonialQueries';
import TestimonialsPageContent from '@/components/testimonials/TestimonialsPageContent';

/** Always read from MongoDB so administrator edits appear without redeploying. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Testimonials | Weir Here Staffing',
  description:
    'What clients and candidates say about partnering with Weir Here Staffing.',
};

export default async function TestimonialsPage() {
  const testimonials = await getPublishedTestimonials();

  return <TestimonialsPageContent testimonials={testimonials} />;
}
