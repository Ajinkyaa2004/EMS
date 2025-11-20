import mongoose, { Document } from 'mongoose';
export interface IUpdate extends Document {
    projectId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    date: Date;
    summary: string;
    loomVideoLink?: string;
    checklist: Array<{
        task: string;
        completed: boolean;
    }>;
    nextPlan: string;
    hoursAttended?: number;
    projectManagement: Array<{
        item: string;
        completed: boolean;
    }>;
    dailyUpdate: Array<{
        item: string;
        completed: boolean;
    }>;
    attachments: Array<{
        fileName: string;
        fileUrl: string;
        uploadedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Update: mongoose.Model<IUpdate, {}, {}, {}, mongoose.Document<unknown, {}, IUpdate> & IUpdate & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Update.d.ts.map