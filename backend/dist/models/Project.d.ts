import mongoose, { Document } from 'mongoose';
export interface IProject extends Document {
    title: string;
    description: string;
    clientId: mongoose.Types.ObjectId;
    projectType: string;
    priority: 'low' | 'medium' | 'high';
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    tags: string[];
    estimatedHours: number;
    startDate: Date;
    endDate: Date;
    leadAssignee?: mongoose.Types.ObjectId;
    virtualAssistant?: mongoose.Types.ObjectId;
    freelancers: mongoose.Types.ObjectId[];
    coders: mongoose.Types.ObjectId[];
    projectLeader?: mongoose.Types.ObjectId;
    isStock?: boolean;
    links: {
        github?: string;
        loom?: string;
        whatsapp?: string;
        oneDrive?: string;
    };
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Project: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject> & IProject & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Project.d.ts.map