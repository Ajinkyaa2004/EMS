import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getEmployeePointsSummary, getPointsLeaderboard, getPointsHistory, addPenaltyPoints, } from '../utils/pointsCalculator.js';
import { Points } from '../models/Points.js';
const router = express.Router();
/**
 * GET /api/points/my-summary
 * Get current user's points summary
 */
router.get('/my-summary', authMiddleware, async (req, res) => {
    try {
        const employeeId = req.user?.id;
        if (!employeeId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log('📊 Fetching points summary for employee:', employeeId);
        const summary = await getEmployeePointsSummary(employeeId);
        console.log('✅ Points summary fetched successfully:', summary);
        res.json(summary);
    }
    catch (error) {
        console.error('❌ Error fetching points summary:', error);
        res.status(500).json({ error: 'Failed to fetch points summary' });
    }
});
/**
 * GET /api/points/my-history
 * Get current user's points history
 */
router.get('/my-history', authMiddleware, async (req, res) => {
    try {
        const employeeId = req.user?.id;
        if (!employeeId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const history = await getPointsHistory(employeeId, limit);
        res.json({
            employeeId,
            count: history.length,
            transactions: history,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch points history' });
    }
});
/**
 * GET /api/points/leaderboard
 * Get points leaderboard (top employees)
 */
router.get('/leaderboard', authMiddleware, async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const leaderboard = await getPointsLeaderboard(limit);
        res.json({
            count: leaderboard.length,
            leaderboard,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});
/**
 * GET /api/points/admin/all (Admin only)
 * Get all employees' points
 */
router.get('/admin/all', authMiddleware, async (req, res) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const allPoints = await Points.find()
            .sort({ totalPoints: -1 })
            .populate('employeeId', 'firstName lastName email');
        const formatted = allPoints.map((record, index) => ({
            rank: index + 1,
            employeeId: record.employeeId?._id,
            employeeName: `${record.employeeId?.firstName} ${record.employeeId?.lastName}`,
            email: record.employeeId?.email,
            totalPoints: record.totalPoints,
            monthlyPoints: record.monthlyPoints,
            currentMonth: record.currentMonth,
            isActive: record.isActive && new Date() < new Date(record.expiryDate),
            expiryDate: record.expiryDate,
            transactionCount: record.transactions.length,
            lastTransaction: record.transactions[record.transactions.length - 1]?.createdAt,
        }));
        res.json({
            count: formatted.length,
            points: formatted,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch all points' });
    }
});
/**
 * GET /api/points/admin/employee/:employeeId (Admin only)
 * Get specific employee's detailed points
 */
router.get('/admin/employee/:employeeId', authMiddleware, async (req, res) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { employeeId } = req.params;
        const pointsRecord = await Points.findOne({ employeeId }).populate('employeeId', 'firstName lastName email');
        if (!pointsRecord) {
            return res.status(404).json({ error: 'Points record not found' });
        }
        const employee = pointsRecord.employeeId || {};
        res.json({
            employeeId: employee._id,
            employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
            email: employee.email,
            totalPoints: pointsRecord.totalPoints,
            monthlyPoints: pointsRecord.monthlyPoints,
            currentMonth: pointsRecord.currentMonth,
            monthlyCapRemaining: Math.max(0, 200 - pointsRecord.monthlyPoints),
            isActive: pointsRecord.isActive,
            expiryDate: pointsRecord.expiryDate,
            transactions: pointsRecord.transactions.slice(-50).reverse(),
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee points' });
    }
});
/**
 * POST /api/points/admin/penalty (Admin only)
 * Apply penalty to an employee
 */
router.post('/admin/penalty', authMiddleware, async (req, res) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { employeeId, penaltyAmount, reason } = req.body;
        if (!employeeId || !penaltyAmount || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await addPenaltyPoints(employeeId, penaltyAmount, reason);
        res.json({
            success: true,
            message: 'Penalty applied successfully',
            ...result,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to apply penalty' });
    }
});
/**
 * GET /api/points/admin/summary (Admin only)
 * Get overall points system summary
 */
router.get('/admin/summary', authMiddleware, async (req, res) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const allPoints = await Points.aggregate([
            {
                $group: {
                    _id: null,
                    totalEmployees: { $sum: 1 },
                    totalPointsDistributed: { $sum: '$totalPoints' },
                    averagePointsPerEmployee: { $avg: '$totalPoints' },
                    maxPoints: { $max: '$totalPoints' },
                    minPoints: { $min: '$totalPoints' },
                    activeEmployees: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$isActive', true] },
                                        { $gt: [{ $dateToString: { format: '%Y-%m-%d', date: '$expiryDate' } }, new Date().toISOString().split('T')[0]] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);
        const summary = allPoints[0] || {
            totalEmployees: 0,
            totalPointsDistributed: 0,
            averagePointsPerEmployee: 0,
            maxPoints: 0,
            minPoints: 0,
            activeEmployees: 0,
        };
        res.json({
            systemSummary: summary,
            config: {
                monthlyCapPoints: 200,
                expiryMonths: 24,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch system summary' });
    }
});
export default router;
//# sourceMappingURL=points.js.map