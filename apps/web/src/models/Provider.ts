import mongoose, { Schema, Document } from 'mongoose';

export interface PhoneNumber {
  number: string;
  isBest: boolean;
}

export interface ProviderDocument extends Document {
  name: string;
  email: string;
  address: string;
  phoneNumbers: PhoneNumber[];
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<ProviderDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true, lowercase: true },
    address: { type: String, default: '' },
    phoneNumbers: [
      {
        number: { type: String, required: true },
        isBest: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Provider ||
  mongoose.model<ProviderDocument>('Provider', ProviderSchema);
