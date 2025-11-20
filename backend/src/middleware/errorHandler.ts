import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Handle CORS errors - don't interfere with CORS middleware
  if (err.message && err.message.includes('CORS')) {
    // Let the browser see the CORS error properly
    return res.status(403).json({ error: err.message });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate field value' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};
