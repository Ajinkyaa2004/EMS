import { Router } from 'express';
import { AutomationJob } from '../models/AutomationJob.js';
import { roleMiddleware } from '../middleware/auth.js';
export const automationRoutes = Router();
// Get all automation jobs (Admin only)
automationRoutes.get('/', roleMiddleware(['admin']), async (req, res) => {
    try {
        const jobs = await AutomationJob.find()
            .populate('recipients', 'firstName lastName email')
            .populate('projectIds', 'title')
            .populate('createdBy', 'firstName lastName');
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch automation jobs' });
    }
});
// Get automation job by ID
automationRoutes.get('/:id', roleMiddleware(['admin']), async (req, res) => {
    try {
        const job = await AutomationJob.findById(req.params.id)
            .populate('recipients', 'firstName lastName email')
            .populate('projectIds', 'title')
            .populate('createdBy', 'firstName lastName');
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});
// Create automation job (Admin only)
automationRoutes.post('/', roleMiddleware(['admin']), async (req, res) => {
    try {
        const jobData = { ...req.body, createdBy: req.user?.id, status: 'draft' };
        const job = new AutomationJob(jobData);
        await job.save();
        res.status(201).json(job);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create job' });
    }
});
// Update automation job (Admin only)
automationRoutes.put('/:id', roleMiddleware(['admin']), async (req, res) => {
    try {
        const job = await AutomationJob.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update job' });
    }
});
// Execute automation job (Admin only)
automationRoutes.post('/:id/execute', roleMiddleware(['admin']), async (req, res) => {
    try {
        const job = await AutomationJob.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        // Simulate sending messages
        const result = {
            sent: job.recipients.length,
            failed: 0,
            errors: [],
        };
        job.status = 'completed';
        job.executedAt = new Date();
        job.result = result;
        await job.save();
        res.json({
            message: 'Job executed successfully',
            result,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to execute job' });
    }
});
// Delete automation job (Admin only)
automationRoutes.delete('/:id', roleMiddleware(['admin']), async (req, res) => {
    try {
        const job = await AutomationJob.findByIdAndDelete(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json({ message: 'Job deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete job' });
    }
});
//# sourceMappingURL=automation.js.map