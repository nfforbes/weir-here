import mongoose, { Schema, Document } from 'mongoose';

export interface QualificationDocument extends Document {
  providerId: mongoose.Types.ObjectId;
  fileName: string;
  description?: string;
  driveFileId: string;
  driveWebViewLink?: string;
  uploadedAt: Date;
}

const QualificationSchema = new Schema<QualificationDocument>({
  providerId: { type: Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  fileName: { type: String, required: true },
  description: { type: String },
  driveFileId: { type: String, required: true },
  driveWebViewLink: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Qualification ||
  mongoose.model<QualificationDocument>('Qualification', QualificationSchema);
