import mongoose, { Schema, Document } from 'mongoose';

export interface AssignmentDocument extends Document {
  clientId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  /** Amount charged to client in cents */
  clientChargeCents: number;
  /** Hourly rate of provider in cents */
  providerHourlyRateCents: number;
  /** Amount paid to provider in cents */
  providerPayCents: number;
  description: string;
  serviceDate: Date;
  status: 'assigned' | 'arrived' | 'completed';
  arrivedAt?: Date;
  checkedOutAt?: Date;
  invoiced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<AssignmentDocument>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
    clientChargeCents: { type: Number, required: true, min: 0 },
    providerHourlyRateCents: { type: Number, required: true, min: 0 },
    providerPayCents: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    serviceDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['assigned', 'arrived', 'completed'], default: 'assigned' },
    arrivedAt: { type: Date },
    checkedOutAt: { type: Date },
    invoiced: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Assignment ||
  mongoose.model<AssignmentDocument>('Assignment', AssignmentSchema);
