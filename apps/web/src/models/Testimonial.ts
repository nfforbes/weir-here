import mongoose, { Schema, Document } from 'mongoose';

export interface TestimonialDocument extends Document {
  quote: string;
  authorName: string;
  authorTitle: string;
  context: string;
  avatarUrl: string;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<TestimonialDocument>(
  {
    quote: { type: String, required: true, trim: true },
    authorName: { type: String, required: true, trim: true },
    authorTitle: { type: String, default: '', trim: true },
    context: { type: String, default: '', trim: true },
    avatarUrl: { type: String, default: '', trim: true },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TestimonialSchema.index({ published: 1, sortOrder: 1, createdAt: -1 });

export default mongoose.models.Testimonial ||
  mongoose.model<TestimonialDocument>('Testimonial', TestimonialSchema);
