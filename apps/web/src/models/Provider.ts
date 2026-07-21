import mongoose, { Schema, Document } from 'mongoose';
import {
  EMPTY_PROVIDER_ADDRESS,
  formatProviderAddress,
  normalizePreferredParishes,
  normalizeSpecialties,
  type ProviderAddressDetails,
} from '@weir-here/shared';

export interface PhoneNumber {
  number: string;
  isBest: boolean;
}

export type { ProviderAddressDetails };

export interface ProviderDocument extends Document {
  name: string;
  email: string;
  address: string;
  addressDetails: ProviderAddressDetails;
  preferredParishes: string[];
  specialties: string[];
  phoneNumbers: PhoneNumber[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressDetailsSchema = new Schema<ProviderAddressDetails>(
  {
    streetLine1: { type: String, default: '' },
    streetLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    parish: { type: String, default: '' },
    postalCode: { type: String, default: '' },
  },
  { _id: false },
);

const ProviderSchema = new Schema<ProviderDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true, lowercase: true },
    address: { type: String, default: '' },
    addressDetails: { type: AddressDetailsSchema, default: () => ({ ...EMPTY_PROVIDER_ADDRESS }) },
    preferredParishes: [{ type: String }],
    specialties: [{ type: String }],
    phoneNumbers: [
      {
        number: { type: String, required: true },
        isBest: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

export function buildProviderAddressPayload(input: {
  address?: string;
  addressDetails?: Partial<ProviderAddressDetails>;
  preferredParishes?: string[];
}) {
  const addressDetails: ProviderAddressDetails = {
    ...EMPTY_PROVIDER_ADDRESS,
    ...(input.addressDetails ?? {}),
  };
  const preferredParishes = normalizePreferredParishes(
    addressDetails.parish,
    input.preferredParishes,
  );
  const address = formatProviderAddress(addressDetails, input.address);
  return { addressDetails, preferredParishes, address };
}

export function normalizeProviderSpecialties(body: Record<string, unknown>) {
  return normalizeSpecialties(body.specialties);
}

export default mongoose.models.Provider ||
  mongoose.model<ProviderDocument>('Provider', ProviderSchema);
