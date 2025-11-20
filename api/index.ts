// Vercel serverless function
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Dynamically import the Express app
  const { default: app } = await import('../backend/dist/index.js');
  
  // Return the Express app handler
  return app(req, res);
}
