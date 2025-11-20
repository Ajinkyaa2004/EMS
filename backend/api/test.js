// Minimal test handler
module.exports = (req, res) => {
  res.json({
    status: 'ok',
    message: 'Vercel function is working',
    path: req.url,
    method: req.method
  });
};
