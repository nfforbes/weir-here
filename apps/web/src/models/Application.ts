import mongoose, { Schema, Document } from 'mongoose';

export interface ScreeningAnswerDoc {
  questionId: string;
  answer: string;
}

export interface ApplicationDocument extends Document {
  jobId: mongoose.Types.ObjectId;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  answers: ScreeningAnswerDoc[];
  resumePath: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningAnswerSchema = new Schema<ScreeningAnswerDoc>(
  {
    questionId: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const ApplicationSchema = new Schema<ApplicationDocument>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    applicantId: { type: String, required: true, index: true },
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    answers: { type: [ScreeningAnswerSchema], default: [] },
    resumePath: { type: String, default: '' },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'accepted', 'rejected'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

/**
 * One application per (job, applicant) for real Auth0 subs. Partial index avoids the classic
 * MongoDB pitfall where a unique compound index on { jobId, userId } treated many docs
 * with missing userId as { userId: null }, allowing only one "anonymous" application per job.
 */
ApplicationSchema.index(
  { jobId: 1, applicantId: 1 },
  {
    unique: true,
    partialFilterExpression: { applicantId: { $type: 'string' } },
  },
);

export default mongoose.models.Application ||
  mongoose.model<ApplicationDocument>('Application', ApplicationSchema);
