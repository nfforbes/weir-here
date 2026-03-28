import { NextResponse } from 'next/server';
import { getPublishedTestimonials } from '@/lib/testimonialQueries';

/** Public list for clients; administrators may also use the admin API for drafts. */
export async function GET() {
  try {
    const testimonials = await getPublishedTestimonials();
    return NextResponse.json({ testimonials });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
