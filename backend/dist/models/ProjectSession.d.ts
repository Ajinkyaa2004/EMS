import mongoose from 'mongoose';
export declare const ProjectSession: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "Active" | "Idle" | "Offline";
    projectId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    attendanceId: mongoose.Types.ObjectId;
    sessionStartTime: Date;
    lastActivityTime: Date;
    totalActiveMinutes: number;
    totalIdleMinutes: number;
    screenActivityLog: {
        type?: "Active" | "Idle" | undefined;
        timestamp?: Date | undefined;
        duration?: number | undefined;
    }[];
    sessionEndTime?: Date | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "Active" | "Idle" | "Offline";
    projectId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    attendanceId: mongoose.Types.ObjectId;
    sessionStartTime: Date;
    lastActivityTime: Date;
    totalActiveMinutes: number;
    totalIdleMinutes: number;
    screenActivityLog: {
        type?: "Active" | "Idle" | undefined;
        timestamp?: Date | undefined;
        duration?: number | undefined;
    }[];
    sessionEndTime?: Date | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "Active" | "Idle" | "Offline";
    projectId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    attendanceId: mongoose.Types.ObjectId;
    sessionStartTime: Date;
    lastActivityTime: Date;
    totalActiveMinutes: number;
    totalIdleMinutes: number;
    screenActivityLog: {
        type?: "Active" | "Idle" | undefined;
        timestamp?: Date | undefined;
        duration?: number | undefined;
    }[];
    sessionEndTime?: Date | undefined;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "Active" | "Idle" | "Offline";
    projectId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    attendanceId: mongoose.Types.ObjectId;
    sessionStartTime: Date;
    lastActivityTime: Date;
    totalActiveMinutes: number;
    totalIdleMinutes: number;
    screenActivityLog: {
        type?: "Active" | "Idle" | undefined;
        timestamp?: Date | undefined;
        duration?: number | undefined;
    }[];
    sessionEndTime?: Date | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "Active" | "Idle" | "Offline";
    projectId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    attendanceId: mongoose.Types.ObjectId;
    sessionStartTime: Date;
    lastActivityTime: Date;
    totalActiveMinutes: number;
    totalIdleMinutes: number;
    screenActivityLog: {
        type?: "Active" | "Idle" | undefined;
        timestamp?: Date | undefined;
        duration?: number | undefined;
    }[];
    sessionEndTime?: Date | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "Active" | "Idle" | "Offline";
    projectId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    attendanceId: mongoose.Types.ObjectId;
    sessionStartTime: Date;
    lastActivityTime: Date;
    totalActiveMinutes: number;
    totalIdleMinutes: number;
    screenActivityLog: {
        type?: "Active" | "Idle" | undefined;
        timestamp?: Date | undefined;
        duration?: number | undefined;
    }[];
    sessionEndTime?: Date | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=ProjectSession.d.ts.map