import mongoose, { Document } from 'mongoose';
export interface ILeadership extends Document {
    employeeId: mongoose.Types.ObjectId;
    leadership: 'team-lead' | 'project-manager' | 'technical-lead' | 'senior-developer' | 'department-head';
    assignedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Leadership: mongoose.Model<ILeadership, {}, {}, {}, mongoose.Document<unknown, {}, ILeadership> & ILeadership & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Leadership.d.ts.map