import mongoose, { Schema, Document } from 'mongoose';

export interface ConfigDocument extends Document {
  key: string;
  value: string;
}

const ConfigSchema = new Schema<ConfigDocument>({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: String, required: true },
});

export default mongoose.models.Config ||
  mongoose.model<ConfigDocument>('Config', ConfigSchema);
