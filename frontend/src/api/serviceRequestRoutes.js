import express from 'express';
import { ServiceRequest } from '../models/index.js';
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

// Get all service requests (filtered by user role)
router.get('/', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    let query = {};
    
    // Filter based on user role
    if (user.role === 'customer') {
      query.customerId = user.id;
    } else if (user.role === 'technician') {
      query.technicianId = user.id;
    }
    // Admin can see all requests (no filter)
    
    const serviceRequests = await ServiceRequest.find(query)
      .populate('customerId', 'fullName email phone')
      .populate('technicianId', 'fullName email phone')
      .sort({ createdAt: -1 });
    
    res.status(200).json(serviceRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get service request by ID
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    const serviceRequest = await ServiceRequest.findById(id)
      .populate('customerId', 'fullName email phone')
      .populate('technicianId', 'fullName email phone');
    
    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    
    // Check if user has access to this service request
    if (user.role !== 'admin' && 
        serviceRequest.customerId.toString() !== user.id && 
        serviceRequest.technicianId?.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.status(200).json(serviceRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new service request
router.post('/', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const serviceRequestData = req.body;
    
    // Ensure customer ID is set to current user if role is customer
    if (user.role === 'customer') {
      serviceRequestData.customerId = user.id;
    }
    
    const serviceRequest = new ServiceRequest(serviceRequestData);
    await serviceRequest.save();
    
    res.status(201).json(serviceRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update service request
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const updateData = req.body;
    
    // Find the service request
    const serviceRequest = await ServiceRequest.findById(id);
    
    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    
    // Check if user has access to update this service request
    if (user.role !== 'admin' && 
        serviceRequest.customerId.toString() !== user.id && 
        serviceRequest.technicianId?.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update the service request
    Object.assign(serviceRequest, updateData);
    await serviceRequest.save();
    
    res.status(200).json(serviceRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete service request
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Find the service request
    const serviceRequest = await ServiceRequest.findById(id);
    
    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    
    // Check if user has access to delete this service request
    // Only admin or the customer who created it can delete
    if (user.role !== 'admin' && serviceRequest.customerId.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete the service request
    await ServiceRequest.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Service request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;