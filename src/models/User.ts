import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  auth0Id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  personas: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    auth0Id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    personas: { type: [String], default: ['user'] },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
