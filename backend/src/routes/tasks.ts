import { Router, Response } from 'express';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { AuthRequest, roleMiddleware } from '../middleware/auth.js';
import { addTaskPoints } from '../utils/pointsCalculator.js';

export const taskRoutes = Router();

// Create task (Admin only)
taskRoutes.post('/', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignedTo, projectId, priority, dueDate } = req.body;

    // Validate assignedTo user exists
    const employee = await User.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const task = new Task({
      title,
      description,
      assignedBy: req.user?.id,
      assignedTo,
      projectId,
      priority,
      dueDate,
      status: 'pending',
    });

    await task.save();
    await task.populate('assignedBy assignedTo projectId');

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get all tasks for admin
taskRoutes.get('/admin/all', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find()
      .populate('assignedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get tasks assigned to current employee
taskRoutes.get('/my-tasks', async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user?.id })
      .populate('assignedBy', 'firstName lastName email')
      .populate('projectId', 'title')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
taskRoutes.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('projectId', 'title');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Update task status (Employee can update their own tasks)
taskRoutes.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is the assignee or admin
    if (task.assignedTo.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();
    await task.populate('assignedBy assignedTo projectId');

    // Award points if task is completed
    let pointsResult = null;
    if (status === 'completed' && oldStatus !== 'completed') {
      pointsResult = await addTaskPoints(
        task.assignedTo.toString(),
        task._id.toString(),
        task.priority as 'low' | 'medium' | 'high'
      );
    }

    res.json({
      message: 'Task status updated',
      task,
      points: pointsResult,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Update task work progress (Employee can update their own tasks)
taskRoutes.patch('/:id/progress', async (req: AuthRequest, res: Response) => {
  try {
    const { workProgress } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is the assignee or admin
    if (task.assignedTo.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // Validate progress is between 0 and 100
    if (workProgress < 0 || workProgress > 100) {
      return res.status(400).json({ error: 'Work progress must be between 0 and 100' });
    }

    task.workProgress = workProgress;
    await task.save();
    await task.populate('assignedBy assignedTo projectId');

    res.json({
      message: 'Task progress updated',
      task,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task progress' });
  }
});

// Update task (Admin only)
taskRoutes.put('/:id', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, priority, dueDate },
      { new: true }
    ).populate('assignedBy assignedTo projectId');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task (Admin only)
taskRoutes.delete('/:id', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});
