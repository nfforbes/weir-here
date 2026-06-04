import mongoose, { Schema, Document } from 'mongoose';

export interface ProviderDocument extends Document {
  name: string;
  info: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<ProviderDocument>(
  {
    name: { type: String, required: true, trim: true },
    info: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Provider ||
  mongoose.model<ProviderDocument>('Provider', ProviderSchema);
