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
  await connectDB();
  const docs = await Testimonial.find({ published: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();
  return docs.map((d) => ({
    id: String(d._id),
    quote: d.quote,
    authorName: d.authorName,
    authorTitle: d.authorTitle ?? '',
    context: d.context ?? '',
    avatarUrl: d.avatarUrl ?? '',
  }));
}
