import { Router, Response } from 'express';
import { User } from '../models/User.js';
import { AuthRequest, roleMiddleware } from '../middleware/auth.js';

export const employeeRoutes = Router();

// Get all employees (accessible to admin)
employeeRoutes.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // Allow admin to fetch all employees
    if (req.user?.role === 'admin') {
      const employees = await User.find({ role: 'employee' }).select('-password');
      return res.json(employees);
    }
    // For other roles, return empty array or their own info
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
employeeRoutes.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create employee (Admin only)
employeeRoutes.post('/', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { email, firstName, lastName, phone } = req.body;
    const defaultPassword = 'TempPassword123!';

    const user = new User({
      email,
      password: defaultPassword,
      firstName,
      lastName,
      phone,
      role: 'employee',
    });

    await user.save();
    res.status(201).json({
      message: 'Employee created successfully',
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee (Admin only)
employeeRoutes.put('/:id', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const employee = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee (Admin only)
employeeRoutes.delete('/:id', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});
