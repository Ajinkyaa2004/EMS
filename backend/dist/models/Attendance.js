import mongoose from 'mongoose';
const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        set: (v) => {
            const d = new Date(v);
            d.setHours(0, 0, 0, 0);
            return d;
        },
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Half-day', 'On Leave', 'WFH'],
        required: true,
    },
    checkInTime: Date,
    checkOutTime: Date,
    workingMinutes: {
        type: Number,
        default: 0,
    },
    selectedProjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    notes: String,
    markedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
// Compound index for unique attendance per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
export const Attendance = mongoose.model('Attendance', attendanceSchema);
//# sourceMappingURL=Attendance.js.map