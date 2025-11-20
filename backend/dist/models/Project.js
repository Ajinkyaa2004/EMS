import mongoose, { Schema } from 'mongoose';
const projectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    projectType: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], default: 'planning' },
    tags: [String],
    estimatedHours: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    leadAssignee: { type: Schema.Types.ObjectId, ref: 'User' },
    virtualAssistant: { type: Schema.Types.ObjectId, ref: 'User' },
    freelancers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    coders: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    projectLeader: { type: Schema.Types.ObjectId, ref: 'User' },
    isStock: { type: Boolean, default: false },
    links: {
        github: String,
        loom: String,
        whatsapp: String,
        oneDrive: String,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export const Project = mongoose.model('Project', projectSchema);
//# sourceMappingURL=Project.js.map