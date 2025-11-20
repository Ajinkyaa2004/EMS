import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadership extends Document {
  employeeId: mongoose.Types.ObjectId;
  leadership: 'team-lead' | 'project-manager' | 'technical-lead' | 'senior-developer' | 'department-head';
  assignedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadershipSchema = new Schema<ILeadership>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    leadership: {
      type: String,
      enum: ['team-lead', 'project-manager', 'technical-lead', 'senior-developer', 'department-head'],
      required: true,
    },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Leadership = mongoose.model<ILeadership>('Leadership', leadershipSchema);
