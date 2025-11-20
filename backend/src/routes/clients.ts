import { Router, Response } from 'express';
import { Client } from '../models/Client.js';
import { AuthRequest, roleMiddleware } from '../middleware/auth.js';

export const clientRoutes = Router();

// Get all clients (Admin only)
clientRoutes.get('/', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const clients = await Client.find().populate('createdBy', 'firstName lastName email');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get client by ID
clientRoutes.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const client = await Client.findById(req.params.id).populate('createdBy', 'firstName lastName email');
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create client (Admin only)
clientRoutes.post('/', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const clientData = { ...req.body, createdBy: req.user?.id };
    const client = new Client(clientData);
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client (Admin only)
clientRoutes.put('/:id', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client (Admin only)
clientRoutes.delete('/:id', roleMiddleware(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
});
