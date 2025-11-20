import { Points } from '../models/Points.js';
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

const POINTS_CONFIG: PointsCalculationConfig = {
  attendance: {
    present: 5,
    onTime: 2,
    late: -1,
  },
  dailyUpdates: {
    rich: 3,
    simple: 1,
  },
  tasks: {
    base: 4,
    priorityBonus: {
      low: 0,
      medium: 2,
      high: 5,
    },
  },
  projectCompletion: {
    base: 50,
    perEmployeeSplit: 10,
    earlyBonus: 10,
  },
  milestones: {
    standard: 20,
    premium: 30,
  },
  monthlyCapPoints: 200,
  expiryMonths: 24,
};

/**
 * Ensure points record exists for employee
 */
export async function ensurePointsRecord(employeeId: string | mongoose.Types.ObjectId) {
  const empId = typeof employeeId === 'string' ? employeeId : employeeId.toString();
  let pointsRecord = await Points.findOne({ employeeId: empId });

  if (!pointsRecord) {
    pointsRecord = new Points({
      employeeId: empId,
      totalPoints: 0,
      monthlyPoints: 0,
      currentMonth: new Date().toISOString().slice(0, 7),
      expiryDate: new Date(Date.now() + POINTS_CONFIG.expiryMonths * 30 * 24 * 60 * 60 * 1000),
    });
    await pointsRecord.save();
  }

  return pointsRecord;
}

/**
 * Check and reset monthly points if needed
 */
export async function checkAndResetMonthlyPoints(pointsRecord: any) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (pointsRecord.currentMonth !== currentMonth) {
    pointsRecord.currentMonth = currentMonth;
    pointsRecord.monthlyPoints = 0;
    pointsRecord.lastReset = new Date();
    await pointsRecord.save();
  }

  return pointsRecord;
}

/**
 * Add points for attendance
 */
export async function addAttendancePoints(employeeId: string, status: string, isOnTime: boolean = true) {
  const pointsRecord = await ensurePointsRecord(employeeId);
  await checkAndResetMonthlyPoints(pointsRecord);

  let points = 0;
  let description = '';

  if (status === 'Present' || status === 'WFH') {
    points = POINTS_CONFIG.attendance.present;
    if (isOnTime) {
      points += POINTS_CONFIG.attendance.onTime;
      description = `Attendance - ${status} (On Time)`;
    } else {
      description = `Attendance - ${status}`;
    }
  } else if (status === 'Late') {
    points = POINTS_CONFIG.attendance.late;
    description = 'Attendance - Late';
  } else if (status === 'Half-day') {
    points = Math.floor(POINTS_CONFIG.attendance.present / 2);
    description = 'Attendance - Half Day';
  }

  // Check monthly cap
  if (pointsRecord.monthlyPoints + points > POINTS_CONFIG.monthlyCapPoints) {
    points = Math.max(0, POINTS_CONFIG.monthlyCapPoints - pointsRecord.monthlyPoints);
    description += ' (Capped at monthly limit)';
  }

  pointsRecord.totalPoints += points;
  pointsRecord.monthlyPoints += points;
  pointsRecord.transactions.push({
    activityType: 'attendance',
    points,
    description,
    metadata: {
      attendanceStatus: status,
    },
    createdAt: new Date(),
  });

  await pointsRecord.save();
  return { points, description };
}

/**
 * Add points for daily updates
 */
export async function addDailyUpdatePoints(employeeId: string, updateType: 'rich' | 'simple') {
  const pointsRecord = await ensurePointsRecord(employeeId);
  await checkAndResetMonthlyPoints(pointsRecord);

  const points = POINTS_CONFIG.dailyUpdates[updateType];
  const description = `Daily Update - ${updateType === 'rich' ? 'Rich (with checklist/attachments)' : 'Simple'}`;

  // Check monthly cap
  if (pointsRecord.monthlyPoints + points > POINTS_CONFIG.monthlyCapPoints) {
    const cappedPoints = Math.max(0, POINTS_CONFIG.monthlyCapPoints - pointsRecord.monthlyPoints);
    pointsRecord.totalPoints += cappedPoints;
    pointsRecord.monthlyPoints += cappedPoints;
    pointsRecord.transactions.push({
      activityType: 'daily_update',
      points: cappedPoints,
      description: `${description} (Capped at monthly limit)`,
      metadata: { updateType },
      createdAt: new Date(),
    });
  } else {
    pointsRecord.totalPoints += points;
    pointsRecord.monthlyPoints += points;
    pointsRecord.transactions.push({
      activityType: 'daily_update',
      points,
      description,
      metadata: { updateType },
      createdAt: new Date(),
    });
  }

  await pointsRecord.save();
  return { points, description };
}

/**
 * Add points for task completion
 */
export async function addTaskPoints(employeeId: string, taskId: string, priority: 'low' | 'medium' | 'high') {
  const pointsRecord = await ensurePointsRecord(employeeId);
  await checkAndResetMonthlyPoints(pointsRecord);

  const basePoints = POINTS_CONFIG.tasks.base;
  const bonusPoints = POINTS_CONFIG.tasks.priorityBonus[priority];
  const points = basePoints + bonusPoints;

  const description = `Task Completed - Priority: ${priority.toUpperCase()} (Base: ${basePoints} + Bonus: ${bonusPoints})`;

  // Check monthly cap
  const finalPoints = pointsRecord.monthlyPoints + points > POINTS_CONFIG.monthlyCapPoints
    ? Math.max(0, POINTS_CONFIG.monthlyCapPoints - pointsRecord.monthlyPoints)
    : points;

  pointsRecord.totalPoints += finalPoints;
  pointsRecord.monthlyPoints += finalPoints;
  pointsRecord.transactions.push({
    activityType: 'task',
    points: finalPoints,
    description: finalPoints < points ? `${description} (Capped at monthly limit)` : description,
    metadata: {
      taskId: taskId,
      taskPriority: priority,
    },
    createdAt: new Date(),
  });

  await pointsRecord.save();
  return { points: finalPoints, description };
}

/**
 * Add points for project completion
 */
export async function addProjectCompletionPoints(
  employeeIds: string[],
  projectId: string,
  isEarlyCompletion: boolean = false
) {
  const results = [];

  for (const employeeId of employeeIds) {
    const pointsRecord = await ensurePointsRecord(employeeId);
    await checkAndResetMonthlyPoints(pointsRecord);

    const basePoints = POINTS_CONFIG.projectCompletion.perEmployeeSplit;
    const earlyBonus = isEarlyCompletion ? POINTS_CONFIG.projectCompletion.earlyBonus : 0;
    const points = basePoints + earlyBonus;

    const description = isEarlyCompletion
      ? `Project Completed (Early) - ${basePoints} base + ${earlyBonus} early bonus`
      : `Project Completed - ${basePoints} points`;

    // Check monthly cap
    const finalPoints = pointsRecord.monthlyPoints + points > POINTS_CONFIG.monthlyCapPoints
      ? Math.max(0, POINTS_CONFIG.monthlyCapPoints - pointsRecord.monthlyPoints)
      : points;

    pointsRecord.totalPoints += finalPoints;
    pointsRecord.monthlyPoints += finalPoints;
    pointsRecord.transactions.push({
      activityType: 'project_completion',
      points: finalPoints,
      description: finalPoints < points ? `${description} (Capped at monthly limit)` : description,
      metadata: {
        projectId: projectId,
      },
      createdAt: new Date(),
    });

    await pointsRecord.save();
    results.push({ employeeId, points: finalPoints, description });
  }

  return results;
}

/**
 * Add points for milestone achievement
 */
export async function addMilestonePoints(employeeId: string, milestoneType: 'standard' | 'premium', description: string) {
  const pointsRecord = await ensurePointsRecord(employeeId);
  await checkAndResetMonthlyPoints(pointsRecord);

  const points = POINTS_CONFIG.milestones[milestoneType];
  const finalDescription = `Milestone: ${description} (${milestoneType === 'premium' ? 'Premium' : 'Standard'} - ${points} points)`;

  // Check monthly cap
  const finalPoints = pointsRecord.monthlyPoints + points > POINTS_CONFIG.monthlyCapPoints
    ? Math.max(0, POINTS_CONFIG.monthlyCapPoints - pointsRecord.monthlyPoints)
    : points;

  pointsRecord.totalPoints += finalPoints;
  pointsRecord.monthlyPoints += finalPoints;
  pointsRecord.transactions.push({
    activityType: 'milestone',
    points: finalPoints,
    description: finalPoints < points ? `${finalDescription} (Capped at monthly limit)` : finalDescription,
    metadata: {
      milestoneType: milestoneType === 'premium' ? 'percentage' : 'completion',
    },
    createdAt: new Date(),
  });

  await pointsRecord.save();
  return { points: finalPoints, description: finalDescription };
}

/**
 * Add penalty points
 */
export async function addPenaltyPoints(employeeId: string, penaltyAmount: number, reason: string) {
  const pointsRecord = await ensurePointsRecord(employeeId);
  await checkAndResetMonthlyPoints(pointsRecord);

  // Penalties can be -20 to -100
  const finalPenalty = Math.max(-100, Math.min(-20, -Math.abs(penaltyAmount)));
  const description = `Penalty: ${reason} (${finalPenalty} points)`;

  pointsRecord.totalPoints = Math.max(0, pointsRecord.totalPoints + finalPenalty);
  pointsRecord.monthlyPoints = Math.max(0, pointsRecord.monthlyPoints + finalPenalty);
  pointsRecord.transactions.push({
    activityType: 'penalty',
    points: finalPenalty,
    description,
    metadata: {
      penaltyReason: reason,
    },
    createdAt: new Date(),
  });

  await pointsRecord.save();
  return { points: finalPenalty, description };
}

/**
 * Get employee points summary
 */
export async function getEmployeePointsSummary(employeeId: string) {
  try {
    console.log('🔍 Getting points summary for employee:', employeeId);
    const pointsRecord = await ensurePointsRecord(employeeId);
    console.log('📋 Points record retrieved:', pointsRecord._id);
    await checkAndResetMonthlyPoints(pointsRecord);

    const summary = {
      totalPoints: pointsRecord.totalPoints,
      monthlyPoints: pointsRecord.monthlyPoints,
      monthlyCapRemaining: Math.max(0, POINTS_CONFIG.monthlyCapPoints - pointsRecord.monthlyPoints),
      currentMonth: pointsRecord.currentMonth,
      expiryDate: pointsRecord.expiryDate,
      isActive: pointsRecord.isActive && new Date() < new Date(pointsRecord.expiryDate),
      transactionCount: pointsRecord.transactions.length,
    };
    
    console.log('✅ Summary calculated:', summary);
    return summary;
  } catch (error) {
    console.error('❌ Error in getEmployeePointsSummary:', error);
    throw error;
  }
}

/**
 * Get points leaderboard
 */
export async function getPointsLeaderboard(limit: number = 10) {
  const leaderboard: any = await Points.find({ isActive: true })
    .sort({ totalPoints: -1 })
    .limit(limit)
    .populate('employeeId', 'firstName lastName email');

  return leaderboard.map((record: any, index: number) => {
    const employee = record.employeeId || {};
    return {
      rank: index + 1,
      employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      email: employee.email || '',
      totalPoints: record.totalPoints,
      monthlyPoints: record.monthlyPoints,
      recentActivity: record.transactions.slice(-3).reverse(),
    };
  });
}

/**
 * Get points history
 */
export async function getPointsHistory(employeeId: string, limit: number = 50) {
  const pointsRecord = await ensurePointsRecord(employeeId);
  return pointsRecord.transactions.slice(-limit).reverse();
}

export { POINTS_CONFIG };
