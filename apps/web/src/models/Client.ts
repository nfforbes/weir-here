import mongoose, { Schema, Document } from 'mongoose';
import {
  EMPTY_ADDRESS_DETAILS,
  formatAddress,
  type AddressDetails,
} from '@weir-here/shared';

export interface PhoneNumber {
  number: string;
  isBest: boolean;
}

export type { AddressDetails };

export interface ClientDocument extends Document {
  name: string;
  email: string;
  address: string;
  addressDetails: AddressDetails;
  phoneNumbers: PhoneNumber[];
  rate: string;
  services: string[];
  patientName: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressDetailsSchema = new Schema<AddressDetails>(
  {
    streetLine1: { type: String, default: '' },
    streetLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    parish: { type: String, default: '' },
    postalCode: { type: String, default: '' },
  },
  { _id: false },
);

const ClientSchema = new Schema<ClientDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    addressDetails: { type: AddressDetailsSchema, default: () => ({ ...EMPTY_ADDRESS_DETAILS }) },
    phoneNumbers: [
      {
        number: { type: String, required: true },
        isBest: { type: Boolean, default: false },
      },
    ],
    rate: { type: String, default: '', trim: true },
    services: { type: [String], default: [] },
    patientName: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

export function buildClientAddressPayload(input: {
  address?: string;
  addressDetails?: Partial<AddressDetails>;
}) {
  const addressDetails: AddressDetails = {
    ...EMPTY_ADDRESS_DETAILS,
    ...(input.addressDetails ?? {}),
  };
  const address = formatAddress(addressDetails, input.address);
  return { addressDetails, address };
}

function normalizeServices(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map((item) => String(item).trim()).filter(Boolean))];
}

export function normalizeClientPayload(body: Record<string, unknown>) {
  const services = normalizeServices(body.services);
  const rate = typeof body.rate === 'string' ? body.rate.trim() : '';
  const patientName = typeof body.patientName === 'string' ? body.patientName.trim() : '';
  return { rate, services, patientName };
}

export default mongoose.models.Client ||
  mongoose.model<ClientDocument>('Client', ClientSchema);
