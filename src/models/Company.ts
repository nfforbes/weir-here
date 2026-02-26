import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ICompanyLocation {
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  remote?: boolean;
}

export interface ICompany extends Document {
  name: string;
  website?: string;
  industry: string;
  size: string;
  logoUrl?: string;
  brandInfo?: string;
  locations: ICompanyLocation[];
  remotePolicy?: string;
  contactPerson: {
    name: string;
    email: string;
    phone?: string;
    hiddenFromPublic: boolean;
  };
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyLocationSchema = new Schema<ICompanyLocation>(
  {
    address: String,
    city: String,
    province: String,
    country: String,
    remote: { type: Boolean, default: false },
  },
  { _id: false }
);

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    website: String,
    industry: { type: String, required: true },
    size: { type: String, required: true },
    logoUrl: String,
    brandInfo: String,
    locations: { type: [CompanyLocationSchema], default: [] },
    remotePolicy: String,
    contactPerson: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      hiddenFromPublic: { type: Boolean, default: false },
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const Company = mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
