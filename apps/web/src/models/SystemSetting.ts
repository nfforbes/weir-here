import mongoose, { Schema, Document } from 'mongoose';

export interface SystemSettingDocument extends Document {
  key: string;
  value: string;
  updatedBy: string;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<SystemSettingDocument>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    updatedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.SystemSetting ||
  mongoose.model<SystemSettingDocument>('SystemSetting', SystemSettingSchema);
