import mongoose, { Document } from 'mongoose';
export interface ITraining extends Document {
    title: string;
    description: string;
    traineeId: mongoose.Types.ObjectId;
    traineeName: string;
    deadline: Date;
    resources?: string;
    status: 'pending' | 'in-progress' | 'completed';
    progress: number;
    lastUpdated: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Training: mongoose.Model<ITraining, {}, {}, {}, mongoose.Document<unknown, {}, ITraining> & ITraining & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Training.d.ts.map