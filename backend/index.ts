// Root handler for Vercel
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    message: 'EMS Backend API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      login: '/api/auth/login'
    }
  });
}
