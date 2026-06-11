import mongoose, { Schema, Document } from 'mongoose';
import { Persona } from '@weir-here/shared';

export interface UserDocument extends Document {
  auth0Id: string;
  email: string;
  name: string;
  personas: Persona[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    auth0Id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    personas: {
      type: [String],
      enum: ['administrator', 'user', 'provider'],
      default: ['user'], // added provider to enum
    },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<UserDocument>('User', UserSchema);
