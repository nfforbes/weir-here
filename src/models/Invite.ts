import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IInvite extends Document {
  email: string;
  jobId?: Types.ObjectId;
  role?: string;
  invitedBy: Types.ObjectId;
  token: string;
  expiresAt: Date;
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema<IInvite>(
  {
    email: { type: String, required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    role: String,
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    accepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Invite = mongoose.models.Invite || mongoose.model<IInvite>('Invite', InviteSchema);
