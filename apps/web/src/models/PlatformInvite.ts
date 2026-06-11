import mongoose, { Schema, Document } from 'mongoose';

export interface PlatformInviteDocument extends Document {
  email: string;
  invitedBy: string;
  token: string;
  accepted: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PlatformInviteSchema = new Schema<PlatformInviteDocument>(
  {
    email: { type: String, required: true },
    invitedBy: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    accepted: { type: Boolean, default: false },
    roles: { type: [String], default: ['user'] },
  },
  { timestamps: true }
);

PlatformInviteSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.PlatformInvite ||
  mongoose.model<PlatformInviteDocument>('PlatformInvite', PlatformInviteSchema);
