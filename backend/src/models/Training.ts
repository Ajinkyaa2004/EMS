import mongoose, { Schema, Document } from 'mongoose';

export interface ITraining extends Document {
  title: string;
  description: string;
  traineeId: mongoose.Types.ObjectId;
  traineeName: string;
  deadline: Date;
  resources?: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
  lastUpdated: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    traineeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    traineeName: { type: String, required: true },
    deadline: { type: Date, required: true },
    resources: String,
    status: { 
      type: String, 
      enum: ['pending', 'in-progress', 'completed'], 
      default: 'pending' 
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Training = mongoose.model<ITraining>('Training', trainingSchema);
