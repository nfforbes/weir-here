import { connectDB } from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';

export type PublicTestimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  context: string;
  avatarUrl: string;
};

export async function getPublishedTestimonials(): Promise<PublicTestimonial[]> {
  try {
    await connectDB();
    const docs = await Testimonial.find({ published: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return docs.map((d) => ({
      id: String(d._id),
      quote: String(d.quote ?? ''),
      authorName: String(d.authorName ?? ''),
      authorTitle: String(d.authorTitle ?? ''),
      context: String(d.context ?? ''),
      avatarUrl: String(d.avatarUrl ?? ''),
    }));
  } catch (err) {
    console.error('[getPublishedTestimonials]', err);
    return [];
  }
}
