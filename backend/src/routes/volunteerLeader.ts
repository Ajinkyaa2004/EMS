import { Router } from 'express';
import mongoose from 'mongoose';
import { VolunteerLeader } from '../models/VolunteerLeader.js';
import { Project } from '../models/Project.js';
import { Points } from '../models/Points.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Employee volunteers to be leader for a project
router.post('/volunteer/:projectId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is part of the project team
    const isPartOfTeam = 
      project.coders.some(id => id.toString() === userId) ||
      project.freelancers.some(id => id.toString() === userId) ||
      project.leadAssignee?.toString() === userId;

    if (!isPartOfTeam) {
      return res.status(403).json({ error: 'You must be part of the project team to volunteer as leader' });
    }

    // Check if user already volunteered for this project
    const existingRequest = await VolunteerLeader.findOne({ projectId, userId });
    if (existingRequest) {
      return res.status(400).json({ error: 'You have already volunteered for this project' });
    }

    // Immediately assign as project leader
    project.projectLeader = new mongoose.Types.ObjectId(userId);
    await project.save();

    // Create volunteer request with accepted status
    const volunteerRequest = new VolunteerLeader({
      projectId,
      userId,
      status: 'accepted',
    });

    await volunteerRequest.save();

    res.status(201).json({
      message: 'You are now the leader of this project!',
      volunteerRequest,
      project,
    });
  } catch (error) {
    console.error('Error volunteering as leader:', error);
    res.status(500).json({ error: 'Failed to volunteer as leader' });
  }
});

// Get all volunteer requests (Admin only)
router.get('/requests', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const requests = await VolunteerLeader.find()
      .populate('userId', 'firstName lastName email')
      .populate('projectId', 'title description status')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching volunteer requests:', error);
    res.status(500).json({ error: 'Failed to fetch volunteer requests' });
  }
});

// Get my volunteer requests (Employee)
router.get('/my-requests', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const requests = await VolunteerLeader.find({ userId })
      .populate('projectId', 'title description status')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching my volunteer requests:', error);
    res.status(500).json({ error: 'Failed to fetch your volunteer requests' });
  }
});

// Admin accepts volunteer request
router.put('/accept/:requestId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { requestId } = req.params;

    const volunteerRequest = await VolunteerLeader.findById(requestId);
    if (!volunteerRequest) {
      return res.status(404).json({ error: 'Volunteer request not found' });
    }

    if (volunteerRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request has already been processed' });
    }

    // Update project with the volunteer as leader
    const project = await Project.findById(volunteerRequest.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.projectLeader) {
      return res.status(400).json({ error: 'Project already has a leader' });
    }

    project.projectLeader = volunteerRequest.userId;
    await project.save();

    // Update volunteer request status
    volunteerRequest.status = 'accepted';
    await volunteerRequest.save();

    res.json({
      message: 'Volunteer request accepted',
      volunteerRequest,
      project,
    });
  } catch (error) {
    console.error('Error accepting volunteer request:', error);
    res.status(500).json({ error: 'Failed to accept volunteer request' });
  }
});

// Admin rejects volunteer request
router.put('/reject/:requestId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { requestId } = req.params;
    const { notes } = req.body;

    const volunteerRequest = await VolunteerLeader.findById(requestId);
    if (!volunteerRequest) {
      return res.status(404).json({ error: 'Volunteer request not found' });
    }

    if (volunteerRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request has already been processed' });
    }

    volunteerRequest.status = 'rejected';
    volunteerRequest.notes = notes;
    await volunteerRequest.save();

    res.json({
      message: 'Volunteer request rejected',
      volunteerRequest,
    });
  } catch (error) {
    console.error('Error rejecting volunteer request:', error);
    res.status(500).json({ error: 'Failed to reject volunteer request' });
  }
});

// Admin marks project outcome and awards points (2x multiplier)
router.put('/complete/:requestId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { requestId } = req.params;
    const { outcome, notes } = req.body; // outcome: 'success' or 'failure'

    if (!outcome || !['success', 'failure'].includes(outcome)) {
      return res.status(400).json({ error: 'Valid outcome required (success or failure)' });
    }

    const volunteerRequest = await VolunteerLeader.findById(requestId);
    if (!volunteerRequest) {
      return res.status(404).json({ error: 'Volunteer request not found' });
    }

    if (volunteerRequest.status !== 'accepted') {
      return res.status(400).json({ error: 'Request must be accepted first' });
    }

    // Get project to determine base points
    const project = await Project.findById(volunteerRequest.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate points based on project priority and outcome
    let basePoints = 0;
    switch (project.priority) {
      case 'high':
        basePoints = 50;
        break;
      case 'medium':
        basePoints = 30;
        break;
      case 'low':
        basePoints = 20;
        break;
    }

    // Apply 2x multiplier for volunteer leaders
    const pointsToAward = outcome === 'success' ? basePoints * 2 : -(basePoints * 2);

    // Update or create points record
    let pointsRecord = await Points.findOne({ employeeId: volunteerRequest.userId });
    
    if (!pointsRecord) {
      pointsRecord = new Points({
        employeeId: volunteerRequest.userId,
        totalPoints: 0,
        transactions: [],
      });
    }

    pointsRecord.totalPoints += pointsToAward;
    pointsRecord.monthlyPoints += pointsToAward;
    pointsRecord.transactions.push({
      activityType: outcome === 'success' ? 'project_completion' : 'penalty',
      points: pointsToAward,
      description: `Volunteer Leader - ${project.title} (${outcome})`,
      metadata: {
        projectId: project._id,
        penaltyReason: outcome === 'failure' ? 'Project failed as volunteer leader' : undefined,
      },
      createdAt: new Date(),
    });

    await pointsRecord.save();

    // Update volunteer request
    volunteerRequest.status = 'completed';
    volunteerRequest.outcome = outcome;
    volunteerRequest.pointsAwarded = pointsToAward;
    volunteerRequest.completedAt = new Date();
    volunteerRequest.notes = notes;
    await volunteerRequest.save();

    res.json({
      message: `Project outcome recorded. ${pointsToAward > 0 ? 'Points awarded' : 'Points deducted'}: ${Math.abs(pointsToAward)}`,
      volunteerRequest,
      pointsRecord,
    });
  } catch (error) {
    console.error('Error completing volunteer request:', error);
    res.status(500).json({ error: 'Failed to complete volunteer request' });
  }
});

// Get projects available for volunteering (Employee)
router.get('/available-projects', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Find ALL projects where user is a team member
    const projects = await Project.find({
      status: { $in: ['planning', 'active'] },
      $or: [
        { coders: userId },
        { freelancers: userId },
        { leadAssignee: userId },
      ],
    })
      .populate('clientId', 'name email')
      .populate('projectLeader', 'firstName lastName email')
      .select('title description priority status startDate endDate projectLeader');

    // Check which projects user has already volunteered for
    const myVolunteerRequests = await VolunteerLeader.find({
      userId,
      projectId: { $in: projects.map(p => p._id) },
    });

    const volunteeredProjectIds = new Set(myVolunteerRequests.map(v => v.projectId.toString()));

    const projectsWithVolunteerStatus = projects.map(project => ({
      ...project.toObject(),
      hasVolunteered: volunteeredProjectIds.has(project._id.toString()),
      volunteerStatus: myVolunteerRequests.find(v => v.projectId.toString() === project._id.toString())?.status,
      hasLeader: !!project.projectLeader,
    }));

    res.json(projectsWithVolunteerStatus);
  } catch (error) {
    console.error('Error fetching available projects:', error);
    res.status(500).json({ error: 'Failed to fetch available projects' });
  }
});

export default router;
