import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  type: string;
  email: string;
  phone?: string;
  contactPerson?: string;
  oneDriveLink?: string;
  gitHubLink?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    contactPerson: String,
    oneDriveLink: String,
    gitHubLink: String,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Client = mongoose.model<IClient>('Client', clientSchema);
