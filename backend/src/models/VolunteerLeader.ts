import mongoose, { Schema, Document } from 'mongoose';

export interface IVolunteerLeader extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  volunteeredAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  outcome?: 'success' | 'failure';
  pointsAwarded?: number;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const volunteerLeaderSchema = new Schema<IVolunteerLeader>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    volunteeredAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'completed'], 
      default: 'pending' 
    },
    outcome: { 
      type: String, 
      enum: ['success', 'failure'],
    },
    pointsAwarded: { type: Number, default: 0 },
    completedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

// Ensure one volunteer request per user per project
volunteerLeaderSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const VolunteerLeader = mongoose.model<IVolunteerLeader>('VolunteerLeader', volunteerLeaderSchema);
