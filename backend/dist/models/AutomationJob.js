import mongoose, { Schema } from 'mongoose';
const automationJobSchema = new Schema({
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
}, { timestamps: true });
export const AutomationJob = mongoose.model('AutomationJob', automationJobSchema);
//# sourceMappingURL=AutomationJob.js.map