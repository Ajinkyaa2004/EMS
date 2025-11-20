import mongoose, { Document } from 'mongoose';
export interface ITask extends Document {
    title: string;
    description: string;
    assignedBy: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    dueDate: Date;
    workProgress: number;
    attachments?: Array<{
        fileName: string;
        fileUrl: string;
        uploadedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Task: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask> & ITask & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Task.d.ts.map