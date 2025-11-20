import { Router, Response } from 'express';
import { Update } from '../models/Update.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';
import { addDailyUpdatePoints } from '../utils/pointsCalculator.js';

export const updateRoutes = Router();

// Get all updates
updateRoutes.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const updates = await Update.find()
      .populate('projectId')
      .populate('employeeId')
      .sort({ date: -1 });
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// Get updates by project
updateRoutes.get('/project/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const updates = await Update.find({ projectId: req.params.projectId })
      .populate('employeeId')
      .sort({ date: -1 });
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// Get updates by employee
updateRoutes.get('/employee/:employeeId', async (req: AuthRequest, res: Response) => {
  try {
    const updates = await Update.find({ employeeId: req.params.employeeId })
      .populate('projectId')
      .sort({ date: -1 });
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// Create update (Employee)
updateRoutes.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const updateData = {
      ...req.body,
      employeeId: req.user?.id,
      date: new Date(req.body.date || new Date()),
    };

    const update = new Update(updateData);
    await update.save();

    // Determine if it's a rich or simple update based on attachments/checklist
    const isRichUpdate = (req.body.attachments && req.body.attachments.length > 0) || 
                        (req.body.checklist && req.body.checklist.length > 0);
    const updateType = isRichUpdate ? 'rich' : 'simple';
    
    // Add points for daily update
    const pointsResult = await addDailyUpdatePoints(req.user?.id || '', updateType);

    await AuditLog.create({
      userId: req.user?.id,
      action: 'CREATE',
      entityType: 'Update',
      entityId: update._id,
      changes: updateData,
    });

    res.status(201).json({
      update,
      points: pointsResult,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create update' });
  }
});

// Update (Employee or Admin)
updateRoutes.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    // Only employee who created or admin can update
    if (update.employeeId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check 24-hour edit window (only for non-admin users)
    if (req.user?.role !== 'admin') {
      const createdAt = new Date(update.createdAt);
      const now = new Date();
      const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursElapsed > 24) {
        return res.status(403).json({ 
          error: 'Cannot edit update after 24 hours',
          hoursElapsed: Math.floor(hoursElapsed),
          createdAt: createdAt,
          editWindowExpired: true
        });
      }
    }

    const updatedUpdate = await Update.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await AuditLog.create({
      userId: req.user?.id,
      action: 'UPDATE',
      entityType: 'Update',
      entityId: update._id,
      changes: req.body,
    });

    res.json(updatedUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete update (Employee or Admin)
updateRoutes.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    if (update.employeeId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Update.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      userId: req.user?.id,
      action: 'DELETE',
      entityType: 'Update',
      entityId: update._id,
      changes: { deletedUpdate: update },
    });

    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

// Get updates for current freelancer
updateRoutes.get('/freelancer', async (req: AuthRequest, res: Response) => {
  try {
    const updates = await Update.find({ employeeId: req.user?.id })
      .populate('projectId')
      .sort({ date: -1 });
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch freelancer updates' });
  }
});
