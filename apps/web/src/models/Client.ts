import mongoose, { Schema, Document } from 'mongoose';

export interface PhoneNumber {
  number: string;
  isBest: boolean;
}

export interface ClientDocument extends Document {
  name: string;
  address: string;
  phoneNumbers: PhoneNumber[];
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<ClientDocument>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phoneNumbers: [
      {
        number: { type: String, required: true },
        isBest: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Client ||
  mongoose.model<ClientDocument>('Client', ClientSchema);
