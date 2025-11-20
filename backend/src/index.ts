import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { authRoutes } from './routes/auth.js';
import { projectRoutes } from './routes/projects.js';
import { employeeRoutes } from './routes/employees.js';
import { updateRoutes } from './routes/updates.js';
import { clientRoutes } from './routes/clients.js';
import { automationRoutes } from './routes/automation.js';
import { auditRoutes } from './routes/audit.js';
import { taskRoutes } from './routes/tasks.js';
import { recommendationRoutes } from './routes/recommendations.js';
import { leadershipRoutes } from './routes/leadership.js';
import attendanceRoutes from './routes/attendance.js';
import sessionRoutes from './routes/sessions.js';
import messageRoutes from './routes/messages.js';
import pointsRoutes from './routes/points.js';
import trainingRoutes from './routes/training.js';
import hackathonRoutes from './routes/hackathon.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.CORS_ORIGIN || 'https://ems-frontend-ten-sandy.vercel.app',
      'https://ems-frontend-ten-sandy.vercel.app'
    ]
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB connection promise - will be reused across serverless invocations
let dbConnectionPromise: Promise<typeof mongoose> | null = null;
let lastConnectionError: string | null = null;

const ensureDbConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }
  
  if (!dbConnectionPromise) {
    console.log('🔌 Attempting MongoDB connection...');
    console.log('📍 URI length:', process.env.MONGODB_URI?.length || 0);
    
    dbConnectionPromise = mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ems',
      {
        serverSelectionTimeoutMS: 10000, // 10 second timeout
        socketTimeoutMS: 45000,
      }
    );
  }
  
  try {
    await dbConnectionPromise;
    console.log('✅ MongoDB connected successfully');
    lastConnectionError = null;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('❌ MongoDB connection error:', errorMessage);
    lastConnectionError = errorMessage;
    dbConnectionPromise = null; // Reset promise so next request retries
    throw err;
  }
};

// Initialize DB connection for non-serverless environments
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  ensureDbConnection().catch(console.error);
}

// Middleware to ensure DB connection before processing requests (skip for debug endpoints)
app.use(async (req, res, next) => {
  // Skip DB connection check for debug/health/test endpoints
  if (req.path === '/api/debug' || req.path === '/api/health' || req.path === '/' || req.path === '/api/test-db') {
    return next();
  }
  
  try {
    await ensureDbConnection();
    next();
  } catch (error) {
    res.status(503).json({ 
      error: 'Database connection error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Root health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'EMS Backend API',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      login: '/api/auth/login',
      register: '/api/auth/register'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/employees', authMiddleware, employeeRoutes);
app.use('/api/updates', authMiddleware, updateRoutes);
app.use('/api/clients', authMiddleware, clientRoutes);
app.use('/api/automation', authMiddleware, automationRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/recommendations', authMiddleware, recommendationRoutes);
app.use('/api/leadership', authMiddleware, leadershipRoutes);
app.use('/api/attendance', authMiddleware, attendanceRoutes);
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/points', authMiddleware, pointsRoutes);
app.use('/api/training', authMiddleware, trainingRoutes);
app.use('/api/hackathon', authMiddleware, hackathonRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV
  });
});

// Debug endpoint (temporary - remove after fixing)
app.get('/api/debug', (req, res) => {
  res.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set (length: ' + process.env.MONGODB_URI.length + ')' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'Not set'
    },
    mongoose: {
      readyState: mongoose.connection.readyState,
      readyStateNames: ['disconnected', 'connected', 'connecting', 'disconnecting'],
      lastError: lastConnectionError
    }
  });
});

// Test connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    await ensureDbConnection();
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      readyState: mongoose.connection.readyState
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.url);
  res.status(404).json({ 
    error: 'Not Found',
    path: req.url,
    method: req.method,
    message: 'The requested resource was not found'
  });
});

// Error handling
app.use(errorHandler);

// Export for Vercel
export default app;

// Start server only if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
