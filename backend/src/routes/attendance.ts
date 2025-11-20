import { Router, Response } from 'express';
import { Attendance } from '../models/Attendance.js';
import { ProjectSession } from '../models/ProjectSession.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { addAttendancePoints } from '../utils/pointsCalculator.js';

const attendanceRoutes = Router();

// Mark attendance for the day
attendanceRoutes.post('/mark', async (req: AuthRequest, res: Response) => {
  try {
    const { status, selectedProjectId, notes } = req.body;
    const employeeId = req.user?.id;

    if (!employeeId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!['Present', 'Absent', 'Late', 'Half-day', 'On Leave', 'WFH'].includes(status)) {
      return res.status(400).json({ error: 'Invalid attendance status' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already marked today
    let attendance = await Attendance.findOne({ employeeId, date: today });

    if (attendance) {
      return res.status(400).json({ error: 'Attendance already marked for today' });
    }

    attendance = new Attendance({
      employeeId,
      date: today,
      status,
      selectedProjectId,
      notes,
      checkInTime: new Date(),
    });

    await attendance.save();

    // If marked Present, WFH, or Late, create a project session
    if (['Present', 'WFH', 'Late'].includes(status) && selectedProjectId) {
      const projectSession = new ProjectSession({
        employeeId,
        projectId: selectedProjectId,
        attendanceId: attendance._id,
        sessionStartTime: new Date(),
        status: 'Active',
      });
      await projectSession.save();
    }

    // Add attendance points
    const isOnTime = status !== 'Late';
    const pointsResult = await addAttendancePoints(employeeId, status, isOnTime);

    const populated = await Attendance.findById(attendance._id)
      .populate('employeeId', 'firstName lastName email')
      .populate('selectedProjectId', 'title');

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: populated,
      points: pointsResult,
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Get today's attendance for current employee
attendanceRoutes.get('/today', async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employeeId, date: today })
      .populate('employeeId', 'firstName lastName email')
      .populate('selectedProjectId', 'title');

    res.json(attendance || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get attendance for a specific date
attendanceRoutes.get('/date/:date', async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.id;
    const dateStr = req.params.date;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employeeId, date })
      .populate('employeeId', 'firstName lastName email')
      .populate('selectedProjectId', 'title');

    res.json(attendance || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get attendance history for current employee
attendanceRoutes.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user?.id;
    const { startDate, endDate } = req.query;

    let query: any = { employeeId };

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName email')
      .populate('selectedProjectId', 'title')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
});

// Admin: Get all attendance for a specific date
attendanceRoutes.get('/admin/date/:date', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const dateStr = req.params.date;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const attendance = await Attendance.find({
      date: { $gte: date, $lt: nextDay },
    })
      .populate('employeeId', 'firstName lastName email phone')
      .populate('selectedProjectId', 'title')
      .sort({ 'employeeId.firstName': 1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance register' });
  }
});

// Admin: Get all attendance for a date range
attendanceRoutes.get('/admin/range', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end },
    })
      .populate('employeeId', 'firstName lastName email phone')
      .populate('selectedProjectId', 'title')
      .sort({ date: -1, 'employeeId.firstName': 1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance range' });
  }
});

// Admin: Get real-time activity for all employees
attendanceRoutes.get('/admin/realtime', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({ date: today })
      .populate('employeeId', 'firstName lastName email')
      .populate('selectedProjectId', 'title');

    const sessions = await ProjectSession.find({
      sessionEndTime: { $exists: false }, // Active sessions only
    })
      .populate('employeeId', 'firstName lastName email')
      .populate('projectId', 'title');

    res.json({
      attendance,
      activeSessions: sessions,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch real-time activity' });
  }
});

// Update attendance status
attendanceRoutes.put('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const attendanceId = req.params.id;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    if (attendance.employeeId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    attendance.status = status;
    attendance.checkOutTime = new Date();

    if (['Absent', 'On Leave', 'Half-day'].includes(status)) {
      // End active sessions
      await ProjectSession.updateMany(
        { attendanceId, sessionEndTime: { $exists: false } },
        { sessionEndTime: new Date(), status: 'Offline' }
      );
    }

    await attendance.save();

    const updated = await Attendance.findById(attendanceId)
      .populate('employeeId', 'firstName lastName email')
      .populate('selectedProjectId', 'title');

    res.json({
      message: 'Attendance status updated',
      attendance: updated,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// Admin: Get weekly aggregate report for all employees
attendanceRoutes.get('/admin/report/weekly', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { weekStart } = req.query;
    let startDate = new Date();
    
    if (weekStart) {
      startDate = new Date(weekStart as string);
    } else {
      // Get the start of current week (Monday)
      startDate = new Date();
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
    }
    
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Get all employees with their attendance for the week
    const employees = await User.find({ role: 'employee' }).select('firstName lastName email');
    
    const weeklyReport = await Promise.all(
      employees.map(async (employee) => {
        const attendance = await Attendance.find({
          employeeId: employee._id,
          date: { $gte: startDate, $lte: endDate },
        }).populate('selectedProjectId', 'title');

        const stats = {
          totalDays: attendance.length,
          present: attendance.filter(a => a.status === 'Present').length,
          late: attendance.filter(a => a.status === 'Late').length,
          absent: attendance.filter(a => a.status === 'Absent').length,
          wfh: attendance.filter(a => a.status === 'WFH').length,
          halfDay: attendance.filter(a => a.status === 'Half-day').length,
          onLeave: attendance.filter(a => a.status === 'On Leave').length,
          attendanceRate: attendance.length > 0 
            ? ((attendance.filter(a => a.status !== 'Absent' && a.status !== 'On Leave').length / 5) * 100).toFixed(2)
            : 0,
          projects: [...new Set(attendance
            .filter(a => a.selectedProjectId)
            .map(a => (a.selectedProjectId as any)?.title)
            .filter(title => title)
          )],
        };

        return {
          employeeId: employee._id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
          ...stats,
        };
      })
    );

    res.json({
      weekStart: startDate,
      weekEnd: endDate,
      employees: weeklyReport,
    });
  } catch (error) {
    console.error('Error fetching weekly report:', error);
    res.status(500).json({ error: 'Failed to fetch weekly report' });
  }
});

// Admin: Get monthly aggregate report for all employees
attendanceRoutes.get('/admin/report/monthly', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { month, year } = req.query;
    const now = new Date();
    const currentMonth = month ? parseInt(month as string) : now.getMonth();
    const currentYear = year ? parseInt(year as string) : now.getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get all employees with their attendance for the month
    const employees = await User.find({ role: 'employee' }).select('firstName lastName email');
    
    const monthlyReport = await Promise.all(
      employees.map(async (employee) => {
        const attendance = await Attendance.find({
          employeeId: employee._id,
          date: { $gte: startDate, $lte: endDate },
        }).populate('selectedProjectId', 'title');

        const stats = {
          totalDays: attendance.length,
          present: attendance.filter(a => a.status === 'Present').length,
          late: attendance.filter(a => a.status === 'Late').length,
          absent: attendance.filter(a => a.status === 'Absent').length,
          wfh: attendance.filter(a => a.status === 'WFH').length,
          halfDay: attendance.filter(a => a.status === 'Half-day').length,
          onLeave: attendance.filter(a => a.status === 'On Leave').length,
          attendanceRate: attendance.length > 0 
            ? ((attendance.filter(a => a.status !== 'Absent' && a.status !== 'On Leave').length / 20) * 100).toFixed(2)
            : 0,
          projects: [...new Set(attendance
            .filter(a => a.selectedProjectId)
            .map(a => (a.selectedProjectId as any)?.title)
            .filter(title => title)
          )],
        };

        return {
          employeeId: employee._id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
          ...stats,
        };
      })
    );

    res.json({
      month: currentMonth + 1,
      year: currentYear,
      monthStart: startDate,
      monthEnd: endDate,
      employees: monthlyReport,
    });
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ error: 'Failed to fetch monthly report' });
  }
});

// Admin: Get individual employee weekly report
attendanceRoutes.get('/admin/report/employee/weekly/:employeeId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { employeeId } = req.params;
    const { weekStart } = req.query;
    
    let startDate = new Date();
    if (weekStart) {
      startDate = new Date(weekStart as string);
    } else {
      startDate = new Date();
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
    }
    
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const employee = await User.findById(employeeId).select('firstName lastName email');
    const attendance = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('employeeId', 'firstName lastName email')
      .populate('selectedProjectId', 'title')
      .sort({ date: 1 });

    const stats = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'Present').length,
      late: attendance.filter(a => a.status === 'Late').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      wfh: attendance.filter(a => a.status === 'WFH').length,
      halfDay: attendance.filter(a => a.status === 'Half-day').length,
      onLeave: attendance.filter(a => a.status === 'On Leave').length,
      attendanceRate: attendance.length > 0 
        ? ((attendance.filter(a => a.status !== 'Absent' && a.status !== 'On Leave').length / 5) * 100).toFixed(2)
        : 0,
    };

    res.json({
      employee: employee ? { name: `${employee.firstName} ${employee.lastName}`, email: employee.email } : null,
      weekStart: startDate,
      weekEnd: endDate,
      stats,
      details: attendance,
    });
  } catch (error) {
    console.error('Error fetching employee weekly report:', error);
    res.status(500).json({ error: 'Failed to fetch employee weekly report' });
  }
});

// Admin: Get individual employee monthly report
attendanceRoutes.get('/admin/report/employee/monthly/:employeeId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { employeeId } = req.params;
    const { month, year } = req.query;
    const now = new Date();
    const currentMonth = month ? parseInt(month as string) : now.getMonth();
    const currentYear = year ? parseInt(year as string) : now.getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const employee = await User.findById(employeeId).select('firstName lastName email');
    const attendance = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('employeeId', 'firstName lastName email')
      .populate('selectedProjectId', 'title')
      .sort({ date: 1 });

    const stats = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'Present').length,
      late: attendance.filter(a => a.status === 'Late').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      wfh: attendance.filter(a => a.status === 'WFH').length,
      halfDay: attendance.filter(a => a.status === 'Half-day').length,
      onLeave: attendance.filter(a => a.status === 'On Leave').length,
      attendanceRate: attendance.length > 0 
        ? ((attendance.filter(a => a.status !== 'Absent' && a.status !== 'On Leave').length / 20) * 100).toFixed(2)
        : 0,
    };

    res.json({
      employee: employee ? { name: `${employee.firstName} ${employee.lastName}`, email: employee.email } : null,
      month: currentMonth + 1,
      year: currentYear,
      monthStart: startDate,
      monthEnd: endDate,
      stats,
      details: attendance,
    });
  } catch (error) {
    console.error('Error fetching employee monthly report:', error);
    res.status(500).json({ error: 'Failed to fetch employee monthly report' });
  }
});

export default attendanceRoutes;
