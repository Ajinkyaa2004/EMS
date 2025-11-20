export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
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
//# sourceMappingURL=errorHandler.js.map