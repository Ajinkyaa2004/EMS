import express from 'express';
import Message from '../models/Message.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Send a message
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { recipientId, recipientType, subject, content, app } = req.body;

    if (!recipientId || !recipientType || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = new Message({
      recipientId,
      recipientType,
      senderId: req.user!.id,
      subject,
      content,
      app: app || 'email',
      status: 'sent',
    });

    await message.save();

    // Populate sender and recipient details
    await message.populate('senderId', 'firstName lastName email');
    await message.populate('recipientId', 'firstName lastName email companyName');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get sent messages (for admin/sender)
router.get('/sent', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const messages = await Message.find({ senderId: req.user!.id })
      .populate('recipientId', 'firstName lastName email companyName')
      .populate('senderId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get received messages (for employee/client)
router.get('/received', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const messages = await Message.find({ recipientId: req.user!.id })
      .populate('senderId', 'firstName lastName email')
      .populate('recipientId', 'firstName lastName email companyName')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching received messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark message as read
router.patch('/:id/read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.recipientId.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    message.status = 'read';
    message.readAt = new Date();
    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete a message
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId.toString() !== req.user!.id && message.recipientId.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
