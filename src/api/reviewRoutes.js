import express from 'express';
import { ServiceReview, ServiceRequest } from '../models/index.js';
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

// Get all public reviews
router.get('/public', async (req, res) => {
  try {
    const reviews = await ServiceReview.find({ isPublic: true })
      .populate('customerId', 'fullName avatarUrl')
      .populate('technicianId', 'userId')
      .populate({
        path: 'technicianId',
        populate: {
          path: 'userId',
          select: 'fullName avatarUrl'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for a specific technician
router.get('/technician/:technicianId', async (req, res) => {
  try {
    const { technicianId } = req.params;
    
    const reviews = await ServiceReview.find({ 
      technicianId,
      isPublic: true 
    })
      .populate('customerId', 'fullName avatarUrl')
      .sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reviews (filtered by user role)
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
    // Admin can see all reviews (no filter)
    
    const reviews = await ServiceReview.find(query)
      .populate('customerId', 'fullName email phone avatarUrl')
      .populate('technicianId', 'userId')
      .populate({
        path: 'technicianId',
        populate: {
          path: 'userId',
          select: 'fullName email phone avatarUrl'
        }
      })
      .populate('serviceRequestId')
      .sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get review by ID
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    const review = await ServiceReview.findById(id)
      .populate('customerId', 'fullName email phone avatarUrl')
      .populate('technicianId', 'userId')
      .populate({
        path: 'technicianId',
        populate: {
          path: 'userId',
          select: 'fullName email phone avatarUrl'
        }
      })
      .populate('serviceRequestId');
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user has access to this review
    if (!review.isPublic && 
        user.role !== 'admin' && 
        review.customerId.toString() !== user.id && 
        review.technicianId?.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new review
router.post('/', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const reviewData = req.body;
    
    // Only customers can create reviews
    if (user.role !== 'customer' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Only customers can create reviews' });
    }
    
    // Ensure customer ID is set to current user if role is customer
    if (user.role === 'customer') {
      reviewData.customerId = user.id;
    }
    
    // Verify the service request exists and belongs to the customer
    const serviceRequest = await ServiceRequest.findById(reviewData.serviceRequestId);
    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    
    if (user.role === 'customer' && serviceRequest.customerId.toString() !== user.id) {
      return res.status(403).json({ error: 'You can only review your own service requests' });
    }
    
    // Check if a review already exists for this service request
    const existingReview = await ServiceReview.findOne({ serviceRequestId: reviewData.serviceRequestId });
    if (existingReview) {
      return res.status(400).json({ error: 'A review already exists for this service request' });
    }
    
    // Set technician ID from service request
    reviewData.technicianId = serviceRequest.technicianId;
    
    const review = new ServiceReview(reviewData);
    await review.save();
    
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update review
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const updateData = req.body;
    
    // Find the review
    const review = await ServiceReview.findById(id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user has access to update this review
    if (user.role !== 'admin') {
      if (user.role === 'customer' && review.customerId.toString() !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      if (user.role === 'technician' && review.technicianId?.toString() !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Technicians can only update responseText
      if (user.role === 'technician') {
        const allowedFields = ['responseText'];
        Object.keys(updateData).forEach(key => {
          if (!allowedFields.includes(key)) {
            delete updateData[key];
          }
        });
      }
    }
    
    // Update the review
    Object.assign(review, updateData);
    await review.save();
    
    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete review
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Find the review
    const review = await ServiceReview.findById(id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user has access to delete this review
    // Only admin or the customer who created it can delete
    if (user.role !== 'admin' && review.customerId.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete the review
    await ServiceReview.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;