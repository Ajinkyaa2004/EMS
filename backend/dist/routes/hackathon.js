import express from 'express';
import { HackathonEvent, HackathonUpdate } from '../models/Hackathon.js';
import { authMiddleware } from '../middleware/auth.js';
import mongoose from 'mongoose';
const router = express.Router();
// Get all hackathons
router.get('/', async (req, res) => {
    try {
        const hackathons = await HackathonEvent.find().sort({ startDate: -1 });
        // If no hackathons exist, create a sample one for testing
        if (hackathons.length === 0) {
            const sampleHackathon = new HackathonEvent({
                name: 'Web3 Innovation Challenge',
                description: 'Build the next generation of decentralized applications',
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                theme: 'Web3 & Blockchain',
                maxPlayers: 50,
                status: 'upcoming',
                currentPlayers: 0,
                players: [],
                updates: [],
                tasks: [],
            });
            await sampleHackathon.save();
            res.json([sampleHackathon]);
        }
        else {
            res.json(hackathons);
        }
    }
    catch (error) {
        console.error('Error fetching hackathons:', error);
        res.status(500).json({ message: 'Error fetching hackathons' });
    }
});
// Get single hackathon
router.get('/:id', async (req, res) => {
    try {
        const hackathon = await HackathonEvent.findById(req.params.id).populate('updates');
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        res.json(hackathon);
    }
    catch (error) {
        console.error('Error fetching hackathon:', error);
        res.status(500).json({ message: 'Error fetching hackathon' });
    }
});
// Create hackathon (Admin only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, startDate, endDate, theme, maxPlayers, prizes } = req.body;
        const hackathon = new HackathonEvent({
            name,
            description,
            startDate,
            endDate,
            theme,
            maxPlayers,
            prizes: prizes || {},
            status: 'upcoming',
            currentPlayers: 0,
            players: [],
            updates: [],
            tasks: [],
        });
        await hackathon.save();
        res.status(201).json(hackathon);
    }
    catch (error) {
        console.error('Error creating hackathon:', error);
        res.status(500).json({ message: 'Error creating hackathon' });
    }
});
// Join hackathon
router.post('/:id/join', authMiddleware, async (req, res) => {
    try {
        const hackathon = await HackathonEvent.findById(req.params.id);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        if (hackathon.currentPlayers >= hackathon.maxPlayers) {
            return res.status(400).json({ message: 'Hackathon is full' });
        }
        // Check if user already joined
        const alreadyJoined = hackathon.players.some(p => p.userId.toString() === req.body.userId);
        if (alreadyJoined) {
            return res.status(400).json({ message: 'Already joined this hackathon' });
        }
        hackathon.players.push({
            userId: new mongoose.Types.ObjectId(req.body.userId),
            name: req.body.name,
            email: req.body.email,
            joinedAt: new Date(),
        });
        hackathon.currentPlayers += 1;
        await hackathon.save();
        res.json({ message: 'Successfully joined hackathon', hackathon });
    }
    catch (error) {
        console.error('Error joining hackathon:', error);
        res.status(500).json({ message: 'Error joining hackathon' });
    }
});
// Submit daily update
router.post('/:id/update', authMiddleware, async (req, res) => {
    try {
        const { hackathonId, playerId, playerName, summary, tasksCompleted, projectProgress, blockers, nextSteps, hoursWorked, loomVideoLink } = req.body;
        const update = new HackathonUpdate({
            hackathonId: new mongoose.Types.ObjectId(hackathonId),
            playerId: new mongoose.Types.ObjectId(playerId),
            playerName,
            date: new Date(),
            summary,
            tasksCompleted,
            projectProgress,
            blockers,
            nextSteps,
            hoursWorked,
            loomVideoLink,
        });
        await update.save();
        // Add update to hackathon
        await HackathonEvent.findByIdAndUpdate(hackathonId, { $push: { updates: update._id } });
        res.status(201).json(update);
    }
    catch (error) {
        console.error('Error submitting update:', error);
        res.status(500).json({ message: 'Error submitting update' });
    }
});
// Get hackathon updates (Admin view)
router.get('/:id/updates', async (req, res) => {
    try {
        const updates = await HackathonUpdate.find({ hackathonId: req.params.id }).sort({ date: -1 });
        res.json(updates);
    }
    catch (error) {
        console.error('Error fetching updates:', error);
        res.status(500).json({ message: 'Error fetching updates' });
    }
});
// Get player's updates
router.get('/:id/player/:playerId/updates', async (req, res) => {
    try {
        const updates = await HackathonUpdate.find({
            hackathonId: req.params.id,
            playerId: req.params.playerId,
        }).sort({ date: -1 });
        res.json(updates);
    }
    catch (error) {
        console.error('Error fetching player updates:', error);
        res.status(500).json({ message: 'Error fetching player updates' });
    }
});
// Update hackathon player's update (within 24 hours)
router.put('/:id/update/:updateId', authMiddleware, async (req, res) => {
    try {
        const update = await HackathonUpdate.findById(req.params.updateId);
        if (!update) {
            return res.status(404).json({ message: 'Update not found' });
        }
        // Check 24-hour edit window
        const createdAt = new Date(update.createdAt);
        const now = new Date();
        const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursElapsed > 24) {
            return res.status(403).json({
                message: 'Cannot edit update after 24 hours',
                hoursElapsed: Math.floor(hoursElapsed),
                createdAt: createdAt,
                editWindowExpired: true
            });
        }
        // Only the player who created the update can edit it
        if (update.playerId.toString() !== req.body.playerId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const updatedUpdate = await HackathonUpdate.findByIdAndUpdate(req.params.updateId, {
            summary: req.body.summary,
            tasksCompleted: req.body.tasksCompleted,
            projectProgress: req.body.projectProgress,
            blockers: req.body.blockers,
            nextSteps: req.body.nextSteps,
            hoursWorked: req.body.hoursWorked,
            loomVideoLink: req.body.loomVideoLink,
        }, { new: true });
        res.json(updatedUpdate);
    }
    catch (error) {
        console.error('Error updating hackathon update:', error);
        res.status(500).json({ message: 'Error updating update' });
    }
});
// Update player bonus multiplier
router.put('/:id/player/:playerId/bonus', authMiddleware, async (req, res) => {
    try {
        const { bonusMultiplier, completedInOneDay } = req.body;
        const hackathon = await HackathonEvent.findById(req.params.id);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        const player = hackathon.players.find(p => p.userId.toString() === req.params.playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        if (bonusMultiplier)
            player.bonusMultiplier = bonusMultiplier;
        if (completedInOneDay !== undefined)
            player.completedInOneDay = completedInOneDay;
        await hackathon.save();
        res.json({ message: 'Bonus updated', player });
    }
    catch (error) {
        console.error('Error updating bonus:', error);
        res.status(500).json({ message: 'Error updating bonus' });
    }
});
// Update player score
router.put('/:id/player/:playerId/score', authMiddleware, async (req, res) => {
    try {
        const { score } = req.body;
        const hackathon = await HackathonEvent.findById(req.params.id);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        const player = hackathon.players.find(p => p.userId.toString() === req.params.playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        player.score = score;
        await hackathon.save();
        res.json({ message: 'Score updated', player });
    }
    catch (error) {
        console.error('Error updating score:', error);
        res.status(500).json({ message: 'Error updating score' });
    }
});
// Create task for hackathon
router.post('/:id/task', authMiddleware, async (req, res) => {
    try {
        const { title, description, dueDate, priority } = req.body;
        const hackathon = await HackathonEvent.findById(req.params.id);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        const task = {
            title,
            description,
            assignedTo: [], // All players see this task
            dueDate,
            priority: priority || 'medium',
        };
        hackathon.tasks.push(task);
        await hackathon.save();
        res.json({ message: 'Task created', task });
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Error creating task' });
    }
});
// Get tasks for hackathon
router.get('/:id/tasks', async (req, res) => {
    try {
        const hackathon = await HackathonEvent.findById(req.params.id);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        res.json(hackathon.tasks || []);
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});
// Get tasks assigned to a player (all players see all tasks)
router.get('/:id/player/:playerId/tasks', async (req, res) => {
    try {
        const hackathon = await HackathonEvent.findById(req.params.id);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        // All players see all tasks
        res.json(hackathon.tasks || []);
    }
    catch (error) {
        console.error('Error fetching player tasks:', error);
        res.status(500).json({ message: 'Error fetching player tasks' });
    }
});
// Delete task
router.delete('/:id/task/:taskId', authMiddleware, async (req, res) => {
    try {
        const hackathon = await HackathonEvent.findById(req.params.id);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }
        hackathon.tasks = hackathon.tasks.filter(t => t._id?.toString() !== req.params.taskId);
        await hackathon.save();
        res.json({ message: 'Task deleted' });
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task' });
    }
});
export default router;
//# sourceMappingURL=hackathon.js.map