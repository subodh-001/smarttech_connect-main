import express from 'express';
import authMiddleware from '../middleware/auth.js';
import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/User.js';
import Technician from '../models/Technician.js';

const router = express.Router();

const activeStatuses = ['pending', 'confirmed', 'in_progress'];

const formatActiveService = (reqDoc) => {
  const technician = reqDoc.technicianId;
  return {
    id: reqDoc._id,
    category: reqDoc.title || reqDoc.category,
    status: reqDoc.status,
    location: reqDoc.locationAddress,
    eta:
      reqDoc.estimatedDuration && reqDoc.status !== 'completed'
        ? `${reqDoc.estimatedDuration} mins`
        : null,
    budget: reqDoc.budgetMax || reqDoc.budgetMin || null,
    technician: technician
      ? {
          id: technician._id,
          name: technician.fullName || technician.email,
          avatar:
            technician.avatarUrl ||
            'https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=' +
              encodeURIComponent(technician.fullName || technician.email),
          phone: technician.phone,
          rating: technician.averageRating || null,
        }
      : null,
    createdAt: reqDoc.createdAt,
  };
};

const formatRecentBooking = (reqDoc) => {
  const technician = reqDoc.technicianId;
  return {
    id: reqDoc._id,
    category: reqDoc.title || reqDoc.category,
    status: reqDoc.status,
    date: reqDoc.completionDate || reqDoc.updatedAt,
    amount: reqDoc.finalCost || reqDoc.budgetMax || reqDoc.budgetMin || 0,
    rating: reqDoc.reviewRating || null,
    technician: technician
      ? {
          id: technician._id,
          name: technician.fullName || technician.email,
          avatar:
            technician.avatarUrl ||
            'https://ui-avatars.com/api/?background=9333EA&color=fff&name=' +
              encodeURIComponent(technician.fullName || technician.email),
        }
      : null,
  };
};

router.get('/user', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only customers can access this dashboard' });
    }

    const customerId = req.user.role === 'admin' && req.query.userId ? req.query.userId : req.user.sub;

    const [userDoc, requests] = await Promise.all([
      User.findById(customerId).lean(),
      ServiceRequest.find({ customerId })
        .populate('technicianId', 'fullName email phone avatarUrl averageRating')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!userDoc) {
      return res.json({
        user: null,
        activeServices: [],
        recentBookings: [],
        wallet: { balance: 0, earned: 0, points: 0, pendingReviews: 0, recommendations: [] },
        stats: { totalBookings: 0, completedServices: 0, totalSpent: 0, moneySaved: 0, avgRatingGiven: 0 },
      });
    }

    const activeServices = requests.filter((r) => activeStatuses.includes(r.status)).map(formatActiveService);
    const recentBookings = requests
      .filter((r) => r.status === 'completed')
      .slice(0, 6)
      .map(formatRecentBooking);

    const completedRequests = requests.filter((r) => r.status === 'completed');
    const totalSpend = completedRequests.reduce((sum, r) => sum + (r.finalCost || 0), 0);
    const totalBookings = requests.length;
    const completedServices = completedRequests.length;

    const stats = {
      totalBookings,
      completedServices,
      totalSpent: Number(totalSpend.toFixed(0)),
      moneySaved: Number((totalSpend * 0.1).toFixed(0)),
      avgRatingGiven:
        completedRequests.length > 0
          ? (
              completedRequests.reduce((sum, r) => sum + (r.reviewRating || 4.5), 0) /
              completedRequests.length
            ).toFixed(1)
          : 0,
    };

    const wallet = {
      balance: Math.max(0, 5000 - totalSpend),
      earned: Number((totalSpend * 0.05).toFixed(0)),
      points: completedServices * 150,
      pendingReviews: requests.filter((r) => r.status === 'completed' && !r.reviewRating).length,
      recommendations: [
        {
          name: 'AC Maintenance',
          price: 299,
          icon: 'Wind',
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          name: 'Home Cleaning',
          price: 499,
          icon: 'Sparkles',
          iconColor: 'text-pink-600',
          bgColor: 'bg-pink-100',
        },
      ],
    };

    const memberSince = userDoc.createdAt ? new Date(userDoc.createdAt).getFullYear() : null;

    res.json({
      user: {
        name: userDoc.fullName || userDoc.email,
        email: userDoc.email,
        phone: userDoc.phone || null,
        location: userDoc.city || 'Bangalore, India',
        memberSince,
      },
      activeServices,
      recentBookings,
      wallet,
      stats,
    });
  } catch (error) {
    console.error('Failed to load user dashboard:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

router.get('/admin', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access this dashboard' });
    }

    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 5, 20);

    const [
      totalUsers,
      totalTechnicians,
      activeServicesCount,
      pendingApprovalCount,
      revenueAgg,
      users,
      services,
      pendingTechs,
    ] = await Promise.all([
      User.countDocuments(),
      Technician.countDocuments(),
      ServiceRequest.countDocuments({ status: { $in: activeStatuses } }),
      Technician.countDocuments({ kycStatus: { $in: ['not_submitted', 'under_review'] } }),
      ServiceRequest.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$finalCost', 0] } } } },
      ]),
      User.find().sort({ createdAt: -1 }).limit(limit).lean(),
      ServiceRequest.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('customerId', 'fullName email')
        .populate('technicianId', 'fullName email')
        .lean(),
      Technician.find({ kycStatus: { $in: ['not_submitted', 'under_review'] } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'fullName email phone')
        .lean(),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const recentUsers = users.map((userDoc) => ({
      id: userDoc._id,
      name: userDoc.fullName || userDoc.email,
      email: userDoc.email,
      role: userDoc.role,
      status: userDoc.isActive === false ? 'inactive' : 'active',
      joinedDate: userDoc.createdAt,
    }));

    const recentServices = services.map((serviceDoc) => ({
      id: serviceDoc._id,
      service: serviceDoc.title || serviceDoc.category,
      customer: serviceDoc.customerId ? serviceDoc.customerId.fullName || serviceDoc.customerId.email : 'Customer',
      technician: serviceDoc.technicianId ? serviceDoc.technicianId.fullName || serviceDoc.technicianId.email : 'Unassigned',
      status: serviceDoc.status,
      date: serviceDoc.updatedAt,
      amount: serviceDoc.finalCost || serviceDoc.budgetMax || serviceDoc.budgetMin || 0,
    }));

    const pendingApprovals = pendingTechs.map((techDoc) => ({
      id: techDoc._id,
      name: techDoc.userId?.fullName || techDoc.userId?.email || 'Technician',
      email: techDoc.userId?.email || null,
      services: techDoc.specialties || [],
      documents: [techDoc.kycGovernmentDocumentPath, techDoc.kycSelfieDocumentPath].filter(Boolean).length,
      submittedDate: techDoc.kycSubmittedAt || techDoc.createdAt,
      phone: techDoc.userId?.phone || null,
    }));

    res.json({
      stats: {
        totalUsers,
        totalTechnicians,
        activeServices: activeServicesCount,
        pendingApprovals: pendingApprovalCount,
        totalRevenue,
      },
      recentUsers,
      recentServices,
      pendingApprovals,
    });
  } catch (error) {
    console.error('Failed to load admin dashboard:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard data' });
  }
});

export default router;


