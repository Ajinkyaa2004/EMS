import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

export const authRoutes = Router();

// Register
authRoutes.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User({ email, password, firstName, lastName, role });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
authRoutes.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check MongoDB connection
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ MongoDB not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({ error: 'Database connection error. Please try again later.' });
    }

    console.log('🔍 Looking for user:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.email, 'Role:', user.role);
    console.log('🔑 Comparing password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email, 'Token generated');
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    res.status(500).json({ 
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// Get current user
authRoutes.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Reset password (admin only)
authRoutes.post('/reset-password/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const adminUser = await User.findById(req.user?.id);
    if (adminUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can reset passwords' });
    }

    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get all freelancers (admin only)
authRoutes.get('/freelancers', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const adminUser = await User.findById(req.user?.id);
    if (adminUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view freelancers' });
    }

    const freelancers = await User.find({ role: 'freelancer' }).select('-password');
    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch freelancers' });
  }
});
