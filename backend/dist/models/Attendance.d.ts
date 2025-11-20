import mongoose from 'mongoose';
export declare const Attendance: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: Date;
    status: "Present" | "WFH" | "Late" | "Half-day" | "Absent" | "On Leave";
    employeeId: mongoose.Types.ObjectId;
    workingMinutes: number;
    markedAt: Date;
    notes?: string | undefined;
    checkInTime?: Date | undefined;
    checkOutTime?: Date | undefined;
    selectedProjectId?: mongoose.Types.ObjectId | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: Date;
    status: "Present" | "WFH" | "Late" | "Half-day" | "Absent" | "On Leave";
    employeeId: mongoose.Types.ObjectId;
    workingMinutes: number;
    markedAt: Date;
    notes?: string | undefined;
    checkInTime?: Date | undefined;
    checkOutTime?: Date | undefined;
    selectedProjectId?: mongoose.Types.ObjectId | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: Date;
    status: "Present" | "WFH" | "Late" | "Half-day" | "Absent" | "On Leave";
    employeeId: mongoose.Types.ObjectId;
    workingMinutes: number;
    markedAt: Date;
    notes?: string | undefined;
    checkInTime?: Date | undefined;
    checkOutTime?: Date | undefined;
    selectedProjectId?: mongoose.Types.ObjectId | undefined;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: Date;
    status: "Present" | "WFH" | "Late" | "Half-day" | "Absent" | "On Leave";
    employeeId: mongoose.Types.ObjectId;
    workingMinutes: number;
    markedAt: Date;
    notes?: string | undefined;
    checkInTime?: Date | undefined;
    checkOutTime?: Date | undefined;
    selectedProjectId?: mongoose.Types.ObjectId | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: Date;
    status: "Present" | "WFH" | "Late" | "Half-day" | "Absent" | "On Leave";
    employeeId: mongoose.Types.ObjectId;
    workingMinutes: number;
    markedAt: Date;
    notes?: string | undefined;
    checkInTime?: Date | undefined;
    checkOutTime?: Date | undefined;
    selectedProjectId?: mongoose.Types.ObjectId | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    date: Date;
    status: "Present" | "WFH" | "Late" | "Half-day" | "Absent" | "On Leave";
    employeeId: mongoose.Types.ObjectId;
    workingMinutes: number;
    markedAt: Date;
    notes?: string | undefined;
    checkInTime?: Date | undefined;
    checkOutTime?: Date | undefined;
    selectedProjectId?: mongoose.Types.ObjectId | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=Attendance.d.ts.map