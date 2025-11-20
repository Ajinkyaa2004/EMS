import mongoose from 'mongoose';
interface PointsCalculationConfig {
    attendance: {
        present: number;
        onTime: number;
        late: number;
    };
    dailyUpdates: {
        rich: number;
        simple: number;
    };
    tasks: {
        base: number;
        priorityBonus: {
            low: number;
            medium: number;
            high: number;
        };
    };
    projectCompletion: {
        base: number;
        perEmployeeSplit: number;
        earlyBonus: number;
    };
    milestones: {
        standard: number;
        premium: number;
    };
    monthlyCapPoints: number;
    expiryMonths: number;
}
declare const POINTS_CONFIG: PointsCalculationConfig;
/**
 * Ensure points record exists for employee
 */
export declare function ensurePointsRecord(employeeId: string | mongoose.Types.ObjectId): Promise<mongoose.Document<unknown, {}, import("../models/Points.js").IPoints> & import("../models/Points.js").IPoints & {
    _id: mongoose.Types.ObjectId;
}>;
/**
 * Check and reset monthly points if needed
 */
export declare function checkAndResetMonthlyPoints(pointsRecord: any): Promise<any>;
/**
 * Add points for attendance
 */
export declare function addAttendancePoints(employeeId: string, status: string, isOnTime?: boolean): Promise<{
    points: number;
    description: string;
}>;
/**
 * Add points for daily updates
 */
export declare function addDailyUpdatePoints(employeeId: string, updateType: 'rich' | 'simple'): Promise<{
    points: number;
    description: string;
}>;
/**
 * Add points for task completion
 */
export declare function addTaskPoints(employeeId: string, taskId: string, priority: 'low' | 'medium' | 'high'): Promise<{
    points: number;
    description: string;
}>;
/**
 * Add points for project completion
 */
export declare function addProjectCompletionPoints(employeeIds: string[], projectId: string, isEarlyCompletion?: boolean): Promise<{
    employeeId: string;
    points: number;
    description: string;
}[]>;
/**
 * Add points for milestone achievement
 */
export declare function addMilestonePoints(employeeId: string, milestoneType: 'standard' | 'premium', description: string): Promise<{
    points: number;
    description: string;
}>;
/**
 * Add penalty points
 */
export declare function addPenaltyPoints(employeeId: string, penaltyAmount: number, reason: string): Promise<{
    points: number;
    description: string;
}>;
/**
 * Get employee points summary
 */
export declare function getEmployeePointsSummary(employeeId: string): Promise<{
    totalPoints: number;
    monthlyPoints: number;
    monthlyCapRemaining: number;
    currentMonth: string;
    expiryDate: Date;
    isActive: boolean;
    transactionCount: number;
}>;
/**
 * Get points leaderboard
 */
export declare function getPointsLeaderboard(limit?: number): Promise<any>;
/**
 * Get points history
 */
export declare function getPointsHistory(employeeId: string, limit?: number): Promise<import("../models/Points.js").IPointsTransaction[]>;
export { POINTS_CONFIG };
//# sourceMappingURL=pointsCalculator.d.ts.map