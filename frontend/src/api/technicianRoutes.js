import express from 'express';
import { Technician, User } from '../models/index.js';
import { authMiddleware } from '../lib/auth.js';

const router = express.Router();

// Middleware to check authentication
const checkAuth = async (req, res, next) => {
  const user = await authMiddleware(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
};

// Get all technicians (public route)
router.get('/', async (req, res) => {
  try {
    const technicians = await Technician.find({ currentStatus: { $ne: 'offline' } })
      .populate('userId', 'fullName email phone avatarUrl');
    
    res.status(200).json(technicians);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get technician by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const technician = await Technician.findById(id)
      .populate('userId', 'fullName email phone avatarUrl');
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    res.status(200).json(technician);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create technician profile (requires authentication)
router.post('/', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const technicianData = req.body;
    
    // Check if user already has a technician profile
    const existingTechnician = await Technician.findOne({ userId: user.id });
    if (existingTechnician) {
      return res.status(400).json({ error: 'User already has a technician profile' });
    }
    
    // Update user role to technician
    await User.findByIdAndUpdate(user.id, { role: 'technician' });
    
    // Create technician profile
    const technician = new Technician({
      ...technicianData,
      userId: user.id
    });
    
    await technician.save();
    
    res.status(201).json(technician);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update technician profile (requires authentication)
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const updateData = req.body;
    
    // Find the technician profile
    const technician = await Technician.findById(id);
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }
    
    // Check if user has access to update this technician profile
    if (user.role !== 'admin' && technician.userId.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update the technician profile
    Object.assign(technician, updateData);
    await technician.save();
    
    res.status(200).json(technician);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update technician status (requires authentication)
router.patch('/:id/status', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { status, lastLocation } = req.body;
    
    // Find the technician profile
    const technician = await Technician.findById(id);
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }
    
    // Check if user has access to update this technician profile
    if (user.role !== 'admin' && technician.userId.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update status and location
    technician.currentStatus = status;
    if (lastLocation) {
      technician.lastLocation = lastLocation;
    }
    
    await technician.save();
    
    res.status(200).json(technician);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete technician profile (requires authentication)
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Find the technician profile
    const technician = await Technician.findById(id);
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }
    
    // Check if user has access to delete this technician profile
    if (user.role !== 'admin' && technician.userId.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete the technician profile
    await Technician.findByIdAndDelete(id);
    
    // Update user role back to customer if it's not an admin
    if (user.role !== 'admin') {
      await User.findByIdAndUpdate(technician.userId, { role: 'customer' });
    }
    
    res.status(200).json({ message: 'Technician profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;