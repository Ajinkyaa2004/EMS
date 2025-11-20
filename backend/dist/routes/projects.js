import { Router } from 'express';
import { Project } from '../models/Project.js';
import { AuditLog } from '../models/AuditLog.js';
import { roleMiddleware } from '../middleware/auth.js';
export const projectRoutes = Router();
// Get all projects
projectRoutes.get('/', async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('clientId')
            .populate('leadAssignee')
            .populate('virtualAssistant')
            .populate('freelancers')
            .populate('coders')
            .populate('projectLeader');
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
// Get project by ID
projectRoutes.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('clientId')
            .populate('leadAssignee')
            .populate('virtualAssistant')
            .populate('freelancers')
            .populate('coders')
            .populate('projectLeader');
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});
// Create project (Admin only)
projectRoutes.post('/', roleMiddleware(['admin']), async (req, res) => {
    try {
        const projectData = { ...req.body, createdBy: req.user?.id };
        const project = new Project(projectData);
        await project.save();
        await AuditLog.create({
            userId: req.user?.id,
            action: 'CREATE',
            entityType: 'Project',
            entityId: project._id,
            changes: projectData,
        });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});
// Update project (Admin only)
projectRoutes.put('/:id', roleMiddleware(['admin']), async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        await AuditLog.create({
            userId: req.user?.id,
            action: 'UPDATE',
            entityType: 'Project',
            entityId: project._id,
            changes: req.body,
        });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});
// Delete project (Admin only)
projectRoutes.delete('/:id', roleMiddleware(['admin']), async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        await AuditLog.create({
            userId: req.user?.id,
            action: 'DELETE',
            entityType: 'Project',
            entityId: project._id,
            changes: { deletedProject: project },
        });
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});
// Get projects assigned to freelancer
projectRoutes.get('/freelancer/assigned', async (req, res) => {
    try {
        const freelancerId = req.user?.id;
        const projects = await Project.find({ freelancers: freelancerId })
            .populate('clientId')
            .populate('leadAssignee')
            .populate('virtualAssistant')
            .populate('freelancers')
            .populate('coders')
            .populate('projectLeader');
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch freelancer projects' });
    }
});
//# sourceMappingURL=projects.js.map