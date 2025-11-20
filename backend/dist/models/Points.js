import mongoose from 'mongoose';
const pointsSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    totalPoints: {
        type: Number,
        default: 0,
    },
    monthlyPoints: {
        type: Number,
        default: 0,
    },
    currentMonth: {
        type: String, // YYYY-MM format
        default: () => new Date().toISOString().slice(0, 7),
    },
    transactions: [
        {
            activityType: {
                type: String,
                enum: ['attendance', 'daily_update', 'task', 'project_completion', 'milestone', 'penalty'],
                required: true,
            },
            points: {
                type: Number,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            metadata: {
                attendanceStatus: String,
                updateType: {
                    type: String,
                    enum: ['rich', 'simple'],
                },
                taskId: mongoose.Schema.Types.ObjectId,
                taskPriority: {
                    type: String,
                    enum: ['low', 'medium', 'high'],
                },
                projectId: mongoose.Schema.Types.ObjectId,
                milestoneType: {
                    type: String,
                    enum: ['completion', 'early', 'percentage'],
                },
                penaltyReason: String,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    lastReset: {
        type: Date,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000), // 24 months
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Index for efficient querying
pointsSchema.index({ employeeId: 1 });
pointsSchema.index({ currentMonth: 1 });
pointsSchema.index({ expiryDate: 1 });
export const Points = mongoose.model('Points', pointsSchema);
//# sourceMappingURL=Points.js.map