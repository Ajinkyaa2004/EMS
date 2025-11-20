import mongoose, { Schema } from 'mongoose';
const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
    dueDate: { type: Date, required: true },
    workProgress: { type: Number, default: 0, min: 0, max: 100 },
    attachments: [
        {
            fileName: String,
            fileUrl: String,
            uploadedAt: Date,
        },
    ],
}, { timestamps: true });
export const Task = mongoose.model('Task', taskSchema);
//# sourceMappingURL=Task.js.map