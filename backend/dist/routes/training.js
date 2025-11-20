import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { Training } from '../models/Training.js';
import { User } from '../models/User.js';
const router = express.Router();
// Get all training tasks (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const trainings = await Training.find()
            .populate('traineeId', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json(trainings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching training tasks' });
    }
});
// Get training tasks for a specific trainee
router.get('/my-trainings', authMiddleware, async (req, res) => {
    try {
        const trainings = await Training.find({ traineeId: req.user?.id })
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json(trainings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching your training tasks' });
    }
});
// Get all trainees (admin only)
router.get('/trainees', authMiddleware, async (req, res) => {
    try {
        const trainees = await User.find({ role: 'trainee' })
            .select('firstName lastName email phone isActive')
            .sort({ firstName: 1 });
        res.json(trainees);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching trainees' });
    }
});
// Create new training task (admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, traineeId, traineeName, deadline, resources } = req.body;
        console.log('📝 Creating training task:', { title, description, traineeId, traineeName, deadline, resources, createdBy: req.user?.id });
        // Validation
        if (!title || !description || !traineeId || !traineeName || !deadline) {
            console.error('❌ Missing required fields');
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const training = new Training({
            title,
            description,
            traineeId,
            traineeName,
            deadline,
            resources,
            createdBy: req.user?.id,
        });
        await training.save();
        console.log('✅ Training task created:', training._id);
        const populatedTraining = await Training.findById(training._id)
            .populate('traineeId', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName');
        res.status(201).json(populatedTraining);
    }
    catch (error) {
        console.error('❌ Error creating training task:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: 'Error creating training task', error: error.message });
    }
});
// Update training progress (trainee can update their own tasks)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status, progress } = req.body;
        const training = await Training.findById(req.params.id);
        if (!training) {
            return res.status(404).json({ message: 'Training task not found' });
        }
        // Check if user is the trainee or admin
        if (training.traineeId.toString() !== req.user?.id && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this training task' });
        }
        training.status = status || training.status;
        training.progress = progress !== undefined ? progress : training.progress;
        training.lastUpdated = new Date();
        await training.save();
        const updatedTraining = await Training.findById(training._id)
            .populate('traineeId', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName');
        res.json(updatedTraining);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating training task' });
    }
});
// Delete training task (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const training = await Training.findByIdAndDelete(req.params.id);
        if (!training) {
            return res.status(404).json({ message: 'Training task not found' });
        }
        res.json({ message: 'Training task deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting training task' });
    }
});
export default router;
//# sourceMappingURL=training.js.map