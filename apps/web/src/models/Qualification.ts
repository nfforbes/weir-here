import mongoose, { Schema, Document } from 'mongoose';

export interface QualificationDocument extends Document {
  clientId: mongoose.Types.ObjectId;
  fileName: string;
  driveFileId: string;
  driveWebViewLink?: string;
  uploadedAt: Date;
}

const QualificationSchema = new Schema<QualificationDocument>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  fileName: { type: String, required: true },
  driveFileId: { type: String, required: true },
  driveWebViewLink: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Qualification ||
  mongoose.model<QualificationDocument>('Qualification', QualificationSchema);
