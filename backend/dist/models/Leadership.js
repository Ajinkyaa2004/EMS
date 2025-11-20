import mongoose, { Schema } from 'mongoose';
const leadershipSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    leadership: {
        type: String,
        enum: ['team-lead', 'project-manager', 'technical-lead', 'senior-developer', 'department-head'],
        required: true,
    },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export const Leadership = mongoose.model('Leadership', leadershipSchema);
//# sourceMappingURL=Leadership.js.map