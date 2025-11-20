import mongoose, { Schema, Document } from 'mongoose';

export interface ICoderRecommendation extends Document {
  employeeId: mongoose.Types.ObjectId;
  skills: string;
  experience: string;
  reason: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const coderRecommendationSchema = new Schema<ICoderRecommendation>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skills: { type: String, required: true },
    experience: { type: String, required: true },
    reason: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const CoderRecommendation = mongoose.model<ICoderRecommendation>('CoderRecommendation', coderRecommendationSchema);
