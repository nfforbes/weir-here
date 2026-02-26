import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IScreeningQuestion {
  question: string;
  type: 'yesno' | 'text';
  required?: boolean;
}

export interface IJob extends Document {
  title: string;
  location: string;
  employmentType: string;
  description: string;
  responsibilities: string;
  requirements: string;
  howToApply: string;
  salaryRange: { min?: number; max?: number; currency?: string };
  categories: string[];
  tags: string[];
  companyId: Types.ObjectId;
  createdBy: Types.ObjectId;
  reviewerEmails: string[];
  screeningQuestions: IScreeningQuestion[];
  skills: string[];
  benefits: string[];
  attachmentUrls: string[];
  status: 'draft' | 'published' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningQuestionSchema = new Schema<IScreeningQuestion>(
  {
    question: { type: String, required: true },
    type: { type: String, enum: ['yesno', 'text'], required: true },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    employmentType: { type: String, required: true },
    description: { type: String, required: true },
    responsibilities: { type: String, required: true },
    requirements: { type: String, required: true },
    howToApply: { type: String, required: true },
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
    categories: { type: [String], default: [] },
    tags: { type: [String], default: [], index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewerEmails: { type: [String], default: [] },
    screeningQuestions: { type: [ScreeningQuestionSchema], default: [] },
    skills: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    attachmentUrls: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
  },
  { timestamps: true }
);


export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
