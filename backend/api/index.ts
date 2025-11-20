// Simple test handler
import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
}
