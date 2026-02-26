import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IReview extends Document {
  applicationId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  rating: number;
  eliminated: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 0, max: 10, required: true },
    eliminated: { type: Boolean, default: false },
    notes: String,
  },
  { timestamps: true }
);

ReviewSchema.index({ applicationId: 1, reviewerId: 1 }, { unique: true });

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
