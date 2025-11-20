import mongoose, { Schema, Document } from 'mongoose';

export interface IUpdate extends Document {
  projectId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  summary: string;
  loomVideoLink?: string;
  checklist: Array<{
    task: string;
    completed: boolean;
  }>;
  nextPlan: string;
  hoursAttended?: number;
  projectManagement: Array<{
    item: string;
    completed: boolean;
  }>;
  dailyUpdate: Array<{
    item: string;
    completed: boolean;
  }>;
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const updateSchema = new Schema<IUpdate>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    summary: { type: String, required: true },
    loomVideoLink: { type: String },
    checklist: [
      {
        task: String,
        completed: { type: Boolean, default: false },
      },
    ],
    nextPlan: String,
    hoursAttended: { type: Number, default: 0 },
    projectManagement: [
      {
        item: String,
        completed: { type: Boolean, default: false },
      },
    ],
    dailyUpdate: [
      {
        item: String,
        completed: { type: Boolean, default: false },
      },
    ],
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Update = mongoose.model<IUpdate>('Update', updateSchema);
