import mongoose, { Schema } from 'mongoose';
const updateSchema = new Schema({
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
}, { timestamps: true });
export const Update = mongoose.model('Update', updateSchema);
//# sourceMappingURL=Update.js.map