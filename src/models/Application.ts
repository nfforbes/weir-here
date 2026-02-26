import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IScreeningAnswer {
  question: string;
  answer: string;
}

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
  resumeUrl: string;
  screeningAnswers: IScreeningAnswer[];
  status: 'submitted' | 'reviewed' | 'eliminated' | 'shortlisted';
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningAnswerSchema = new Schema<IScreeningAnswer>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, required: true },
    screeningAnswers: { type: [ScreeningAnswerSchema], default: [] },
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'eliminated', 'shortlisted'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export const Application =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
