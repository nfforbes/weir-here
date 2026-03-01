import mongoose, { Schema, Document } from 'mongoose';

export interface ReviewDocument extends Document {
  applicationId: mongoose.Types.ObjectId;
  reviewerId: string;
  rating: number;
  eliminated: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    reviewerId: { type: String, required: true },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    eliminated: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

ReviewSchema.index({ applicationId: 1, reviewerId: 1 }, { unique: true });

export default mongoose.models.Review ||
  mongoose.model<ReviewDocument>('Review', ReviewSchema);
