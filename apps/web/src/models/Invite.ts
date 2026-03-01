import mongoose, { Schema, Document } from 'mongoose';

export interface InviteDocument extends Document {
  email: string;
  jobId: mongoose.Types.ObjectId;
  invitedBy: string;
  token: string;
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema<InviteDocument>(
  {
    email: { type: String, required: true },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    invitedBy: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    accepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

InviteSchema.index({ email: 1, jobId: 1 }, { unique: true });

export default mongoose.models.Invite ||
  mongoose.model<InviteDocument>('Invite', InviteSchema);
