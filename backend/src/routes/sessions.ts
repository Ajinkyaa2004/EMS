import { Router, Response } from 'express';
import { ProjectSession } from '../models/ProjectSession.js';
import { Attendance } from '../models/Attendance.js';
import { AuthRequest } from '../middleware/auth.js';

const sessionRoutes = Router();

// Start a new project session
sessionRoutes.post('/start', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.body;
    const employeeId = req.user?.id;

    if (!employeeId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if there's an active attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employeeId, date: today });

    if (!attendance) {
      return res.status(400).json({ error: 'Must mark attendance first' });
    }

    // Check if there's an active session
    const activeSession = await ProjectSession.findOne({
      employeeId,
      sessionEndTime: { $exists: false },
    });

    if (activeSession) {
      return res.status(400).json({
        error: 'Already have an active session. End it first.',
        activeSession,
      });
    }

    const session = new ProjectSession({
      employeeId,
      projectId,
      attendanceId: attendance._id,
      sessionStartTime: new Date(),
      status: 'Active',
    });

    await session.save();

    const populated = await ProjectSession.findById(session._id)
      .populate('employeeId', 'firstName lastName email')
      .populate('projectId', 'title');

    res.status(201).json({
      message: 'Project session started',
      session: populated,
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start project session' });
  }
});

// End current project session
sessionRoutes.post('/end', async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.id;

    if (!employeeId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await ProjectSession.findOne({
      employeeId,
      sessionEndTime: { $exists: false },
    });

    if (!session) {
      return res.status(404).json({ error: 'No active session found' });
    }

    session.sessionEndTime = new Date();
    session.status = 'Offline';

    // Calculate total active minutes
    const startTime = session.sessionStartTime;
    const endTime = new Date();
    const totalMinutes = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 60000
    );

    session.totalActiveMinutes = totalMinutes;

    await session.save();

    const updated = await ProjectSession.findById(session._id)
      .populate('employeeId', 'firstName lastName email')
      .populate('projectId', 'title');

    res.json({
      message: 'Project session ended',
      session: updated,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end project session' });
  }
});

// Get current active session
sessionRoutes.get('/current', async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.id;

    const session = await ProjectSession.findOne({
      employeeId,
      sessionEndTime: { $exists: false },
    })
      .populate('employeeId', 'firstName lastName email')
      .populate('projectId', 'title');

    res.json(session || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current session' });
  }
});

// Update session status (Active/Idle/Offline)
sessionRoutes.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const sessionId = req.params.id;

    if (!['Active', 'Idle', 'Offline'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const session = await ProjectSession.findByIdAndUpdate(
      sessionId,
      {
        status,
        lastActivityTime: new Date(),
      },
      { new: true }
    )
      .populate('employeeId', 'firstName lastName email')
      .populate('projectId', 'title');

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session status' });
  }
});

// Get session history for employee
sessionRoutes.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.id;
    const { startDate, endDate } = req.query;

    let query: any = { employeeId };

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      query.sessionStartTime = { $gte: start, $lte: end };
    }

    const sessions = await ProjectSession.find(query)
      .populate('employeeId', 'firstName lastName email')
      .populate('projectId', 'title')
      .sort({ sessionStartTime: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session history' });
  }
});

// Admin: Get all active sessions
sessionRoutes.get('/admin/active', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const sessions = await ProjectSession.find({
      sessionEndTime: { $exists: false },
    })
      .populate('employeeId', 'firstName lastName email')
      .populate('projectId', 'title');

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

// Admin: Get employee session summary for a date
sessionRoutes.get('/admin/summary/:employeeId/:date', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { employeeId, date } = req.params;
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    const sessions = await ProjectSession.find({
      employeeId,
      sessionStartTime: { $gte: dateObj, $lt: nextDay },
    })
      .populate('employeeId', 'firstName lastName email')
      .populate('projectId', 'title');

    const totalMinutes = sessions.reduce((sum, s) => sum + s.totalActiveMinutes, 0);

    res.json({
      employeeId,
      date: dateObj,
      sessions,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session summary' });
  }
});

export default sessionRoutes;
