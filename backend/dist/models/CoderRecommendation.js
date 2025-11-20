import mongoose, { Schema } from 'mongoose';
const coderRecommendationSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skills: { type: String, required: true },
    experience: { type: String, required: true },
    reason: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export const CoderRecommendation = mongoose.model('CoderRecommendation', coderRecommendationSchema);
//# sourceMappingURL=CoderRecommendation.js.map