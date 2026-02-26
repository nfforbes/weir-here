import mongoose, { Schema, type Document } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

export const Settings =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export const MS365_KEYS = [
  'MS365_CLIENT_ID',
  'MS365_CLIENT_SECRET',
  'MS365_TENANT_ID',
  'MS365_SHAREPOINT_SITE_ID',
  'MS365_RESUME_FOLDER_PATH',
  'MS365_LOGO_FOLDER_PATH',
  'MS365_JOB_ATTACHMENT_PATH',
] as const;

export type MS365Key = (typeof MS365_KEYS)[number];

export async function getMS365Settings(): Promise<Record<string, string>> {
  const settings = await Settings.find({ key: { $in: MS365_KEYS } });
  const result: Record<string, string> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
}
