import mongoose, { Schema, Document } from 'mongoose';

export interface IAutomationJob extends Document {
  name: string;
  triggerType: 'assignment' | 'update' | 'deadline';
  channel: 'email' | 'whatsapp' | 'telegram';
  template: string;
  recipients: mongoose.Types.ObjectId[];
  projectIds?: mongoose.Types.ObjectId[];
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
  scheduledFor?: Date;
  executedAt?: Date;
  result?: {
    sent: number;
    failed: number;
    errors: string[];
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const automationJobSchema = new Schema<IAutomationJob>(
  {
    name: { type: String, required: true },
    triggerType: { type: String, enum: ['assignment', 'update', 'deadline'], required: true },
    channel: { type: String, enum: ['email', 'whatsapp', 'telegram'], required: true },
    template: { type: String, required: true },
    recipients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    projectIds: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    status: { type: String, enum: ['draft', 'scheduled', 'running', 'completed', 'failed'], default: 'draft' },
    scheduledFor: Date,
    executedAt: Date,
    result: {
      sent: Number,
      failed: Number,
      errors: [String],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const AutomationJob = mongoose.model<IAutomationJob>('AutomationJob', automationJobSchema);
