import { Router } from 'express';
import { Leadership } from '../models/Leadership.js';
import { User } from '../models/User.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
export const leadershipRoutes = Router();
// Get all leadership assignments (admin only)
leadershipRoutes.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    try {
        const assignments = await Leadership.find()
            .populate('employeeId', 'firstName lastName email')
            .populate('assignedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json(assignments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch leadership assignments' });
    }
});
// Get leadership by employee (accessible to employees)
leadershipRoutes.get('/employee/:employeeId', authMiddleware, async (req, res) => {
    try {
        const leadership = await Leadership.findOne({ employeeId: req.params.employeeId }).populate('employeeId', 'firstName lastName email');
        res.json(leadership || null);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch leadership info' });
    }
});
// Assign leadership (admin only)
leadershipRoutes.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    try {
        const { employeeId, leadership } = req.body;
        if (!employeeId || !leadership) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const validRoles = ['team-lead', 'project-manager', 'technical-lead', 'senior-developer', 'department-head'];
        if (!validRoles.includes(leadership)) {
            return res.status(400).json({ error: 'Invalid leadership role' });
        }
        const employee = await User.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        // Check if already has a leadership assignment and update it
        let leadershipDoc = await Leadership.findOne({ employeeId });
        if (leadershipDoc) {
            leadershipDoc.leadership = leadership;
            leadershipDoc.assignedBy = req.user?.id;
            await leadershipDoc.save();
        }
        else {
            leadershipDoc = new Leadership({
                employeeId,
                leadership,
                assignedBy: req.user?.id,
            });
            await leadershipDoc.save();
        }
        await leadershipDoc.populate('employeeId', 'firstName lastName email');
        res.status(201).json({
            message: 'Leadership assigned successfully',
            leadership: leadershipDoc,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to assign leadership' });
    }
});
// Remove leadership (admin only)
leadershipRoutes.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    try {
        const leadership = await Leadership.findByIdAndDelete(req.params.id);
        if (!leadership) {
            return res.status(404).json({ error: 'Leadership assignment not found' });
        }
        res.json({ message: 'Leadership assignment removed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to remove leadership assignment' });
    }
});
//# sourceMappingURL=leadership.js.map