// Vercel serverless function wrapper
export default async function handler(req, res) {
  try {
    // Dynamically import the Express app
    const { default: app } = await import('../backend/dist/index.js');
    
    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
