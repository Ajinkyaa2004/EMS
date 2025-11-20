import { Router, Response } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest, roleMiddleware } from '../middleware/auth.js';

export const auditRoutes = Router();

// Get all audit logs (Admin only)
auditRoutes.get('/', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'firstName lastName email')
      .populate('entityId')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit logs by entity
auditRoutes.get('/entity/:entityType/:entityId', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find({
      entityType: req.params.entityType,
      entityId: req.params.entityId,
    })
      .populate('userId', 'firstName lastName email')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit logs by user
auditRoutes.get('/user/:userId', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find({ userId: req.params.userId })
      .populate('entityId')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});
