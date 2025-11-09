import express from 'express';
import ServiceRequest from '../models/ServiceRequest.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const formatServiceRequest = (request) => {
  const doc = request.toObject({ virtuals: true });
  const technicianUser = doc.technicianId || doc.technician;
  const customerUser = doc.customerId || doc.customer;

  return {
    id: doc._id,
    category: doc.category,
    title: doc.title,
    description: doc.description,
    priority: doc.priority,
    status: doc.status,
    scheduledDate: doc.scheduledDate,
    completionDate: doc.completionDate,
    estimatedDuration: doc.estimatedDuration,
    budgetMin: doc.budgetMin,
    budgetMax: doc.budgetMax,
    finalCost: doc.finalCost,
    reviewRating: doc.reviewRating,
    locationAddress: doc.locationAddress,
    locationCoordinates: doc.locationCoordinates,
    images: doc.images || [],
    requirements: doc.requirements || {},
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    customer: customerUser
      ? {
          id: customerUser._id,
          name: customerUser.fullName || customerUser.email,
          email: customerUser.email,
          phone: customerUser.phone,
        }
      : null,
    technician: technicianUser
      ? {
          id: technicianUser._id,
          name: technicianUser.fullName || technicianUser.email,
          email: technicianUser.email,
          phone: technicianUser.phone,
          avatar: technicianUser.avatarUrl,
        }
      : null,
  };
};

router.get('/available', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'technician') {
      return res.status(403).json({ error: 'Only technicians can view available requests' });
    }

    const requests = await ServiceRequest.find({
      $and: [
        {
          $or: [
            { technicianId: { $exists: false } },
            { technicianId: null },
          ],
        },
        { status: { $in: ['pending'] } },
      ],
    })
      .populate('customerId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(requests.map(formatServiceRequest));
  } catch (error) {
    console.error('Failed to fetch available requests:', error);
    res.status(500).json({ error: 'Failed to fetch available service requests' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, sub } = req.user;
    const { status, limit = 50 } = req.query;

    const filter = {};

    if (role === 'technician') {
      filter.technicianId = sub;
    } else if (role === 'admin') {
      // allow optional filtering via query param customerId/technicianId
      if (req.query.customerId) filter.customerId = req.query.customerId;
      if (req.query.technicianId) filter.technicianId = req.query.technicianId;
    } else {
      filter.customerId = sub;
    }

    if (status) {
      filter.status = status;
    }

    const requests = await ServiceRequest.find(filter)
      .populate('technicianId', 'fullName email phone avatarUrl')
      .populate('customerId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(requests.map(formatServiceRequest));
  } catch (error) {
    console.error('Failed to fetch service requests:', error);
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { role, sub } = req.user;
    if (role !== 'user' && role !== 'admin') {
      return res.status(403).json({ error: 'Only customers can create service requests' });
    }

    const payload = req.body || {};
    const request = await ServiceRequest.create({
      ...payload,
      customerId: role === 'admin' && payload.customerId ? payload.customerId : sub,
    });

    const populated = await ServiceRequest.findById(request._id)
      .populate('technicianId', 'fullName email phone avatarUrl')
      .populate('customerId', 'fullName email phone');

    res.status(201).json(formatServiceRequest(populated));
  } catch (error) {
    console.error('Failed to create service request:', error);
    res.status(500).json({ error: 'Failed to create service request' });
  }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, finalCost, technicianId } = req.body || {};

    const request = await ServiceRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (status) request.status = status;
    if (finalCost !== undefined) request.finalCost = finalCost;
    if (technicianId) request.technicianId = technicianId;
    if (status === 'completed') {
      request.completionDate = new Date();
    }
    await request.save();

    const populated = await ServiceRequest.findById(id)
      .populate('technicianId', 'fullName email phone avatarUrl')
      .populate('customerId', 'fullName email phone');

    res.json(formatServiceRequest(populated));
  } catch (error) {
    console.error('Failed to update service request:', error);
    res.status(500).json({ error: 'Failed to update service request' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await ServiceRequest.findById(id)
      .populate('technicianId', 'fullName email phone avatarUrl')
      .populate('customerId', 'fullName email phone');
    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    res.json(formatServiceRequest(request));
  } catch (error) {
    console.error('Failed to fetch service request:', error);
    res.status(500).json({ error: 'Failed to fetch service request' });
  }
});

export default router;


