import mongoose, { Schema, Document } from 'mongoose';
import { slugify } from '@/lib/slugify';

export interface ScreeningQuestionDoc {
  id: string;
  question: string;
  type: 'yes_no' | 'text';
  required: boolean;
}

export interface JobDocument extends Document {
  title: string;
  slug: string;
  location: string;
  employmentType: string;
  description: string;
  responsibilities: string;
  requirements: string;
  howToApply: string;
  salaryRange: { min: number; max: number; currency: string };
  categories: string[];
  tags: string[];
  expiresAt: Date | null;
  screeningQuestions: ScreeningQuestionDoc[];
  skills: string[];
  benefits: string[];
  attachmentPaths: string[];
  reviewerEmails: string[];
  postedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningQuestionSchema = new Schema<ScreeningQuestionDoc>(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    type: { type: String, enum: ['yes_no', 'text'], required: true },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const JobSchema = new Schema<JobDocument>(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    location: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship'],
      required: true,
    },
    description: { type: String, required: true },
    responsibilities: { type: String, required: true },
    requirements: { type: String, required: true },
    howToApply: { type: String, required: true },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'JMD' },
    },
    categories: { type: [String], default: [], index: true },
    tags: { type: [String], default: [], index: true },
    expiresAt: { type: Date, default: null, index: true },
    screeningQuestions: { type: [ScreeningQuestionSchema], default: [] },
    skills: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    attachmentPaths: { type: [String], default: [] },
    reviewerEmails: { type: [String], default: [] },
    postedBy: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

JobSchema.pre('validate', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = slugify(this.title);
    if (!baseSlug) baseSlug = 'job';
    
    // Check for uniqueness
    let slug = baseSlug;
    let counter = 1;
    const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
    
    while (await Job.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

JobSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.models.Job ||
  mongoose.model<JobDocument>('Job', JobSchema);
