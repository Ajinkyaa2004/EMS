import mongoose, { Document } from 'mongoose';
export interface IAutomationJob extends Document {
    name: string;
    triggerType: 'assignment' | 'update' | 'deadline';
    channel: 'email' | 'whatsapp' | 'telegram';
    template: string;
    recipients: mongoose.Types.ObjectId[];
    projectIds?: mongoose.Types.ObjectId[];
    status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
    scheduledFor?: Date;
    executedAt?: Date;
    result?: {
        sent: number;
        failed: number;
        errors: string[];
    };
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AutomationJob: mongoose.Model<IAutomationJob, {}, {}, {}, mongoose.Document<unknown, {}, IAutomationJob> & IAutomationJob & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=AutomationJob.d.ts.map