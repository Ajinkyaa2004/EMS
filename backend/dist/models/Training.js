import mongoose, { Schema } from 'mongoose';
const trainingSchema = new Schema({
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
}, { timestamps: true });
export const Training = mongoose.model('Training', trainingSchema);
//# sourceMappingURL=Training.js.map