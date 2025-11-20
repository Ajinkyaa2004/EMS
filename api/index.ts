// Vercel serverless function
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Cache the app instance
    if (!app) {
      const module = await import('../backend/dist/index.js');
      app = module.default;
    }
    
    // Express app should handle the request/response
    return new Promise((resolve, reject) => {
      // Make Express handle the serverless request
      app(req, res, (err: any) => {
        if (err) {
          console.error('Express error:', err);
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
