import { Router, Response } from 'express';
import { CoderRecommendation } from '../models/CoderRecommendation.js';
import { User } from '../models/User.js';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth.js';

export const recommendationRoutes = Router();

// Get all recommendations (admin only)
recommendationRoutes.get('/', authMiddleware, roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const recommendations = await CoderRecommendation.find()
      .populate('employeeId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Create recommendation (admin only)
recommendationRoutes.post('/', authMiddleware, roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, skills, experience, reason } = req.body;

    if (!employeeId || !skills || !experience || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const recommendation = new CoderRecommendation({
      employeeId,
      skills,
      experience,
      reason,
      createdBy: req.user?.id,
    });

    await recommendation.save();
    await recommendation.populate('employeeId', 'firstName lastName email');

    res.status(201).json({
      message: 'Recommendation created successfully',
      recommendation,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recommendation' });
  }
});

// Delete recommendation (admin only)
recommendationRoutes.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const recommendation = await CoderRecommendation.findByIdAndDelete(req.params.id);
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json({ message: 'Recommendation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recommendation' });
  }
});
