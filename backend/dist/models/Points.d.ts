import mongoose from 'mongoose';
interface IPointsTransaction {
    activityType: 'attendance' | 'daily_update' | 'task' | 'project_completion' | 'milestone' | 'penalty';
    points: number;
    description: string;
    metadata?: {
        attendanceStatus?: string;
        updateType?: 'rich' | 'simple';
        taskId?: string;
        taskPriority?: 'low' | 'medium' | 'high';
        projectId?: string;
        milestoneType?: 'completion' | 'early' | 'percentage';
        penaltyReason?: string;
    };
    createdAt: Date;
}
interface IPoints extends mongoose.Document {
    employeeId: mongoose.Schema.Types.ObjectId;
    totalPoints: number;
    monthlyPoints: number;
    currentMonth: string;
    transactions: IPointsTransaction[];
    lastReset: Date;
    expiryDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Points: mongoose.Model<IPoints, {}, {}, {}, mongoose.Document<unknown, {}, IPoints> & IPoints & {
    _id: mongoose.Types.ObjectId;
}, any>;
export type { IPoints, IPointsTransaction };
//# sourceMappingURL=Points.d.ts.map