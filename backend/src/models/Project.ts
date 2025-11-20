import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  clientId: mongoose.Types.ObjectId;
  projectType: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  tags: string[];
  estimatedHours: number;
  startDate: Date;
  endDate: Date;
  leadAssignee?: mongoose.Types.ObjectId;
  virtualAssistant?: mongoose.Types.ObjectId;
  freelancers: mongoose.Types.ObjectId[];
  coders: mongoose.Types.ObjectId[];
  projectLeader?: mongoose.Types.ObjectId;
  isStock?: boolean;
  links: {
    github?: string;
    loom?: string;
    whatsapp?: string;
    oneDrive?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    projectType: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], default: 'planning' },
    tags: [String],
    estimatedHours: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    leadAssignee: { type: Schema.Types.ObjectId, ref: 'User' },
    virtualAssistant: { type: Schema.Types.ObjectId, ref: 'User' },
    freelancers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    coders: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    projectLeader: { type: Schema.Types.ObjectId, ref: 'User' },
    isStock: { type: Boolean, default: false },
    links: {
      github: String,
      loom: String,
      whatsapp: String,
      oneDrive: String,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
