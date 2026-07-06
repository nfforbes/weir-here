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
  rateServices: string;
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
    rateServices: { type: String, default: '', trim: true },
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

export default mongoose.models.Client ||
  mongoose.model<ClientDocument>('Client', ClientSchema);
