import mongoose, { Schema, Document } from 'mongoose';

export interface ClientDocument extends Document {
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<ClientDocument>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Client ||
  mongoose.model<ClientDocument>('Client', ClientSchema);
