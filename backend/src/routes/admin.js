import express from 'express';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
import Technician from '../models/Technician.js';
import ServiceRequest from '../models/ServiceRequest.js';
import AdminSetting from '../models/AdminSetting.js';
import path from 'path';
import { TECHNICIAN_SPECIALTIES, SPECIALTY_LABEL_MAP } from '../constants/technicianSpecialties.js';

const router = express.Router();

const ensureAdmin = (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return false;
  }
  return true;
};

const toPlainUser = (doc, extras = {}) => ({
  id: doc._id ? doc._id.toString() : undefined,
  code: doc.publicId || null,
  name: doc.fullName || doc.email,
  email: doc.email,
  phone: doc.phone || null,
  role: doc.role,
  status: doc.isActive === false ? 'inactive' : 'active',
  city: doc.city || null,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  ...extras,
});

const toPlainService = (doc) => {
  const technicianUser = doc.technicianId || doc.technician;
  const customerUser = doc.customerId || doc.customer;
  const amount = doc.finalCost ?? doc.budgetMax ?? doc.budgetMin ?? 0;

  return {
    id: doc._id ? doc._id.toString() : undefined,
    code: doc.publicId || null,
    title: doc.title,
    category: doc.category,
    status: doc.status,
    amount,
    createdAt: doc.createdAt,
    customer: customerUser
      ? {
          id: customerUser._id ? customerUser._id.toString() : undefined,
          code: customerUser.publicId || null,
          name: customerUser.fullName || customerUser.email,
        }
      : null,
    technician: technicianUser
      ? {
          id: technicianUser._id ? technicianUser._id.toString() : undefined,
          code: technicianUser.publicId || null,
          name: technicianUser.fullName || technicianUser.email,
        }
      : null,
  };
};

const toPlainServiceDetailed = (doc) => {
  const base = toPlainService(doc);
  return {
    ...base,
    description: doc.description,
    priority: doc.priority,
    location: doc.locationAddress,
    scheduledDate: doc.scheduledDate,
    completionDate: doc.completionDate,
    estimatedDuration: doc.estimatedDuration,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    category: doc.category,
  };
};

const documentCountForTechnician = (doc) =>
  [doc.kycGovernmentDocumentPath, doc.kycSelfieDocumentPath].filter(Boolean).length;

const toPlainPendingTechnician = (doc) => {
  const userDoc = doc.userId || {};
  return {
    id: doc._id ? doc._id.toString() : undefined,
    userId: userDoc._id ? userDoc._id.toString() : undefined,
    name: userDoc.fullName || userDoc.email || 'Technician',
    email: userDoc.email || null,
    specialties: doc.specialties || [],
    documents: documentCountForTechnician(doc),
    kycStatus: doc.kycStatus,
    submittedAt: doc.kycSubmittedAt || doc.createdAt,
    serviceRadius: doc.serviceRadius || 0,
    yearsOfExperience: doc.yearsOfExperience || 0,
  };
};

const toPlainTechnician = (doc, extras = {}) => {
  const userDoc = doc.userId || {};
  const governmentUrl = doc.kycGovernmentDocumentPath
    ? `/uploads/kyc/${path.basename(doc.kycGovernmentDocumentPath)}`
    : null;
  const selfieUrl = doc.kycSelfieDocumentPath
    ? `/uploads/kyc/${path.basename(doc.kycSelfieDocumentPath)}`
    : null;
  return {
    id: doc._id ? doc._id.toString() : undefined,
    code: doc.publicId || null,
    userId: userDoc._id ? userDoc._id.toString() : undefined,
    userCode: userDoc.publicId || null,
    name: userDoc.fullName || userDoc.email || 'Technician',
    email: userDoc.email || null,
    phone: userDoc.phone || null,
    city: userDoc.city || null,
    role: userDoc.role || 'technician',
    userStatus: userDoc.isActive === false ? 'inactive' : 'active',
    specialties: doc.specialties || [],
    specialtyLabels: (doc.specialties || []).map((spec) => SPECIALTY_LABEL_MAP[spec] || spec),
    currentStatus: doc.currentStatus,
    kycStatus: doc.kycStatus,
    serviceRadius: doc.serviceRadius || 0,
    yearsOfExperience: doc.yearsOfExperience || 0,
    averageRating: doc.averageRating || 0,
    totalJobs: doc.totalJobs || 0,
    documents: documentCountForTechnician(doc),
    documentsInfo: {
      governmentId: governmentUrl,
      governmentOriginal: doc.kycGovernmentDocumentOriginalName || null,
      selfie: selfieUrl,
      selfieOriginal: doc.kycSelfieDocumentOriginalName || null,
    },
    kycSubmittedAt: doc.kycSubmittedAt,
    kycReviewedAt: doc.kycReviewedAt,
    kycFeedback: doc.kycFeedback || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    assignments: {
      total: extras.totalAssignments || 0,
      completed: extras.completedAssignments || 0,
    },
    ...extras.additional,
  };
};

const DEFAULT_ADMIN_SETTINGS = [
  {
    key: 'auto_assign_technicians',
    label: 'Auto assign technicians',
    description: 'Automatically assign available technicians to new service requests.',
    value: true,
    type: 'boolean',
    category: 'operations',
  },
  {
    key: 'enable_technician_location_tracking',
    label: 'Enable location tracking',
    description: 'Allow technicians to share live location during active jobs.',
    value: true,
    type: 'boolean',
    category: 'operations',
  },
  {
    key: 'default_service_window_hours',
    label: 'Default service window (hours)',
    description: 'Expected turnaround time for standard service requests.',
    value: 48,
    type: 'number',
    category: 'scheduling',
  },
  {
    key: 'maintenance_mode',
    label: 'Maintenance mode',
    description: 'Temporarily disable new bookings while maintenance is underway.',
    value: false,
    type: 'boolean',
    category: 'platform',
  },
  {
    key: 'notification_email',
    label: 'Notification email',
    description: 'Primary email address for escalations and alerts.',
    value: 'ops@smarttechconnect.com',
    type: 'string',
    category: 'platform',
  },
];

const ensureDefaultSettings = async () => {
  const existing = await AdminSetting.find({}, 'key').lean();
  const existingKeys = new Set(existing.map((item) => item.key));

  const toInsert = DEFAULT_ADMIN_SETTINGS.filter((setting) => !existingKeys.has(setting.key));
  if (toInsert.length > 0) {
    await AdminSetting.insertMany(toInsert);
  }
};

router.get('/overview', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      totalTechnicians,
      availableTechnicians,
      activeServices,
      revenueAggregate,
      recentSignups,
      recentUsersDocs,
      recentServicesDocs,
      pendingTechnicians,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Technician.countDocuments(),
      Technician.countDocuments({ currentStatus: 'available' }),
      ServiceRequest.countDocuments({ status: { $in: ['pending', 'confirmed', 'in_progress'] } }),
      ServiceRequest.aggregate([
        { $match: { status: 'completed', finalCost: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$finalCost' } } },
      ]),
      User.countDocuments({ role: { $ne: 'admin' }, createdAt: { $gte: sevenDaysAgo } }),
      User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      ServiceRequest.find()
        .populate('customerId', 'fullName email')
        .populate('technicianId', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Technician.find({ kycStatus: { $in: ['under_review', 'not_submitted'] } })
        .populate('userId', 'fullName email')
        .sort({ kycSubmittedAt: -1, createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const totalRevenue = revenueAggregate.length ? revenueAggregate[0].total : 0;

    res.json({
      stats: {
        totalUsers,
        totalTechnicians,
        availableTechnicians,
        activeServices,
        pendingApprovalsCount: pendingTechnicians.length,
        totalRevenue,
        recentSignups,
      },
      recentUsers: recentUsersDocs.map(toPlainUser),
      recentServices: recentServicesDocs.map(toPlainService),
      pendingApprovals: pendingTechnicians.map(toPlainPendingTechnician),
    });
  } catch (error) {
    console.error('Failed to load admin overview:', error);
    res.status(500).json({ error: 'Failed to load admin overview data.' });
  }
});

const parsePagination = (req) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

const buildUserFilters = (query) => {
  const filter = {};
  const role = query.role;
  const status = query.status;
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  if (role && role !== 'all') {
    filter.role = role;
  } else {
    filter.role = { $ne: 'admin' };
  }

  if (status === 'active') {
    filter.isActive = { $ne: false };
  } else if (status === 'inactive') {
    filter.isActive = false;
  }

  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { fullName: regex },
      { email: regex },
      { phone: regex },
      { city: regex },
      { publicId: regex },
    ];
  }

  return filter;
};

const mapTechnicianData = (docs) => {
  const map = new Map();
  docs.forEach((doc) => {
    if (doc.userId) {
      map.set(doc.userId.toString(), {
        technicianId: doc._id ? doc._id.toString() : undefined,
        kycStatus: doc.kycStatus,
        currentStatus: doc.currentStatus,
      });
    }
  });
  return map;
};

router.get('/users', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const { limit, page, skip } = parsePagination(req);
    const filters = buildUserFilters(req.query || {});

    const [users, total] = await Promise.all([
      User.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filters),
    ]);

    const userIds = users.map((doc) => doc._id);

    let serviceCountMap = new Map();
    let technicianMap = new Map();

    if (userIds.length > 0) {
      const [serviceCounts, technicianDocs] = await Promise.all([
        ServiceRequest.aggregate([
          { $match: { customerId: { $in: userIds } } },
          { $group: { _id: '$customerId', total: { $sum: 1 } } },
        ]),
        Technician.find({ userId: { $in: userIds } }, 'userId kycStatus currentStatus').lean(),
      ]);

      serviceCountMap = new Map(serviceCounts.map((entry) => [entry._id.toString(), entry.total]));
      technicianMap = mapTechnicianData(technicianDocs);
    }

    const data = users.map((doc) =>
      toPlainUser(doc, {
        serviceCount: serviceCountMap.get(doc._id.toString()) || 0,
        technician: technicianMap.get(doc._id.toString()) || null,
      })
    );

    res.json({
      data,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Failed to list users:', error);
    res.status(500).json({ error: 'Failed to load users.' });
  }
});

router.get('/users/:id', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const userDoc = await User.findById(id).lean();
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const [serviceCount, technicianDoc, recentServices] = await Promise.all([
      ServiceRequest.countDocuments({ customerId: userDoc._id }),
      Technician.findOne({ userId: userDoc._id }, 'kycStatus currentStatus serviceRadius yearsOfExperience').lean(),
      ServiceRequest.find({ customerId: userDoc._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('technicianId', 'fullName email')
        .lean(),
    ]);

    res.json({
      user: toPlainUser(userDoc, {
        serviceCount,
        technician: technicianDoc
          ? {
              technicianId: technicianDoc._id ? technicianDoc._id.toString() : undefined,
              kycStatus: technicianDoc.kycStatus,
              currentStatus: technicianDoc.currentStatus,
              serviceRadius: technicianDoc.serviceRadius,
              yearsOfExperience: technicianDoc.yearsOfExperience,
            }
          : null,
      }),
      recentServices: recentServices.map((service) => toPlainService(service)),
    });
  } catch (error) {
    console.error('Failed to fetch user details:', error);
    res.status(500).json({ error: 'Failed to load user details.' });
  }
});

router.patch('/users/:id', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const payload = req.body || {};
    const allowedRoles = ['user', 'technician', 'admin'];
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(payload, 'fullName')) {
      updates.fullName = typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'phone')) {
      updates.phone = typeof payload.phone === 'string' ? payload.phone.trim() : '';
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'city')) {
      updates.city = typeof payload.city === 'string' ? payload.city.trim() : '';
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'address')) {
      updates.address = typeof payload.address === 'string' ? payload.address.trim() : '';
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'role')) {
      if (!allowedRoles.includes(payload.role)) {
        return res.status(400).json({ error: 'Invalid role specified.' });
      }
      updates.role = payload.role;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'isActive')) {
      if (typeof payload.isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive must be a boolean value.' });
      }
      updates.isActive = payload.isActive;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    const userDoc = await User.findById(id);
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (updates.isActive === false && userDoc._id.toString() === req.user.sub) {
      return res.status(400).json({ error: 'You cannot deactivate your own account.' });
    }

    Object.assign(userDoc, updates);
    await userDoc.save();

    if (updates.role === 'technician') {
      const existingProfile = await Technician.findOne({ userId: userDoc._id });
      if (!existingProfile) {
        await Technician.create({
          userId: userDoc._id,
          specialties: [],
          yearsOfExperience: 0,
          hourlyRate: 0,
          averageRating: 0,
          totalJobs: 0,
          bio: '',
          certifications: [],
          serviceRadius: 0,
          currentStatus: 'available',
          kycStatus: 'not_submitted',
        });
      }
    }

    const [serviceCount, technicianDoc] = await Promise.all([
      ServiceRequest.countDocuments({ customerId: userDoc._id }),
      Technician.findOne({ userId: userDoc._id }, 'kycStatus currentStatus').lean(),
    ]);

    res.json({
      user: toPlainUser(userDoc.toObject(), {
        serviceCount,
        technician: technicianDoc
          ? {
              technicianId: technicianDoc._id ? technicianDoc._id.toString() : undefined,
              kycStatus: technicianDoc.kycStatus,
              currentStatus: technicianDoc.currentStatus,
            }
          : null,
      }),
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

const buildTechnicianFilters = async (query) => {
  const filter = {};
  const status = query.status;
  const kyc = query.kyc;
  const specialty = query.specialty;
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  if (status && status !== 'all') {
    filter.currentStatus = status;
  }

  if (specialty && specialty !== 'all') {
    filter.specialties = specialty;
  }

  if (kyc && kyc !== 'all') {
    if (kyc === 'pending') {
      filter.kycStatus = { $in: ['not_submitted', 'under_review'] };
    } else {
      filter.kycStatus = kyc;
    }
  }

  if (!search) {
    return filter;
  }

  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

  const matchingUsers = await User.find(
    {
      $or: [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { city: regex },
        { publicId: regex },
      ],
    },
    '_id'
  ).lean();

  if (matchingUsers.length === 0) {
    // No matches, ensure query returns empty
    filter.userId = { $in: [null] };
  } else {
    filter.userId = { $in: matchingUsers.map((u) => u._id) };
  }

  return filter;
};

router.get('/technicians', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const { limit, page, skip } = parsePagination(req);
    const filters = await buildTechnicianFilters(req.query || {});

    const query = Technician.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email phone city role isActive createdAt updatedAt publicId')
      .lean();

    const [technicians, total] = await Promise.all([query, Technician.countDocuments(filters)]);

    const userIds = technicians
      .map((tech) => (tech.userId?._id ? tech.userId._id : null))
      .filter(Boolean);

    let assignmentsMap = new Map();
    if (userIds.length > 0) {
      const assignmentAgg = await ServiceRequest.aggregate([
        { $match: { technicianId: { $in: userIds } } },
        {
          $group: {
            _id: '$technicianId',
            totalAssignments: { $sum: 1 },
            completedAssignments: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
              },
            },
          },
        },
      ]);

      assignmentsMap = new Map(
        assignmentAgg.map((entry) => [
          entry._id.toString(),
          {
            totalAssignments: entry.totalAssignments,
            completedAssignments: entry.completedAssignments,
          },
        ])
      );
    }

    const data = technicians.map((tech) => {
      const userId = tech.userId?._id ? tech.userId._id.toString() : undefined;
      const assignments = userId ? assignmentsMap.get(userId) || {} : {};
      return toPlainTechnician(tech, assignments);
    });

    res.json({
      data,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Failed to list technicians:', error);
    res.status(500).json({ error: 'Failed to load technicians.' });
  }
});

router.get('/technicians/:id', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid technician id.' });
    }

    const technicianDoc = await Technician.findById(id).populate(
      'userId',
      'fullName email phone city role isActive createdAt updatedAt publicId'
    );

    if (!technicianDoc) {
      return res.status(404).json({ error: 'Technician not found.' });
    }

    const userId = technicianDoc.userId?._id;

    const [assignmentsAgg, recentServices] = await Promise.all([
      userId
        ? ServiceRequest.aggregate([
            { $match: { technicianId: userId } },
            {
              $group: {
                _id: '$technicianId',
                totalAssignments: { $sum: 1 },
                completedAssignments: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                  },
                },
              },
            },
          ])
        : [],
      userId
        ? ServiceRequest.find({ technicianId: userId })
            .sort({ updatedAt: -1 })
            .limit(6)
            .populate('customerId', 'fullName email')
            .lean()
        : [],
    ]);

    const assignments = assignmentsAgg.length > 0 ? assignmentsAgg[0] : {};

    res.json({
      technician: toPlainTechnician(technicianDoc, {
        totalAssignments: assignments.totalAssignments || 0,
        completedAssignments: assignments.completedAssignments || 0,
      }),
      recentServices: recentServices.map((service) => ({
        id: service._id ? service._id.toString() : undefined,
        title: service.title,
        status: service.status,
        customer: service.customerId
          ? service.customerId.fullName || service.customerId.email
          : 'Customer',
        budgetMax: service.budgetMax,
        budgetMin: service.budgetMin,
        finalCost: service.finalCost,
        updatedAt: service.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch technician details:', error);
    res.status(500).json({ error: 'Failed to load technician details.' });
  }
});

router.patch('/technicians/:id', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid technician id.' });
    }

    const payload = req.body || {};
    const technicianDoc = await Technician.findById(id).populate('userId');

    if (!technicianDoc) {
      return res.status(404).json({ error: 'Technician not found.' });
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(payload, 'currentStatus')) {
      const allowedStatuses = ['available', 'busy', 'offline'];
      if (!allowedStatuses.includes(payload.currentStatus)) {
        return res.status(400).json({ error: 'Invalid technician status.' });
      }
      updates.currentStatus = payload.currentStatus;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'kycStatus')) {
      const allowedKycStatuses = ['not_submitted', 'under_review', 'approved', 'rejected'];
      if (!allowedKycStatuses.includes(payload.kycStatus)) {
        return res.status(400).json({ error: 'Invalid KYC status.' });
      }
      updates.kycStatus = payload.kycStatus;
      updates.kycReviewedAt = new Date();
      if (payload.kycFeedback !== undefined) {
        updates.kycFeedback = typeof payload.kycFeedback === 'string' ? payload.kycFeedback.trim() : '';
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'serviceRadius')) {
      const radius = Number(payload.serviceRadius);
      if (Number.isNaN(radius) || radius < 0) {
        return res.status(400).json({ error: 'Service radius must be a positive number.' });
      }
      updates.serviceRadius = radius;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'yearsOfExperience')) {
      const years = Number(payload.yearsOfExperience);
      if (!Number.isInteger(years) || years < 0) {
        return res.status(400).json({ error: 'Years of experience must be a non-negative integer.' });
      }
      updates.yearsOfExperience = years;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'specialties')) {
      if (!Array.isArray(payload.specialties)) {
        return res.status(400).json({ error: 'Specialties must be an array.' });
      }
      updates.specialties = payload.specialties.map((item) => String(item).trim()).filter(Boolean);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'averageRating')) {
      const rating = Number(payload.averageRating);
      if (Number.isNaN(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({ error: 'Average rating must be between 0 and 5.' });
      }
      updates.averageRating = rating;
    }

    if (Object.keys(updates).length > 0) {
      Object.assign(technicianDoc, updates);
    }

    if (payload.userActive !== undefined) {
      const isActive = Boolean(payload.userActive);
      if (technicianDoc.userId) {
        technicianDoc.userId.isActive = isActive;
        await technicianDoc.userId.save();
      }
    }

    if (payload.promoteToTechnician === true && technicianDoc.userId) {
      technicianDoc.userId.role = 'technician';
      await technicianDoc.userId.save();
    }

    if (updates.kycStatus === 'approved' && technicianDoc.userId) {
      technicianDoc.userId.role = 'technician';
      await technicianDoc.userId.save();
    }

    await technicianDoc.save();

    const [assignmentAgg] = technicianDoc.userId
      ? await ServiceRequest.aggregate([
          { $match: { technicianId: technicianDoc.userId._id } },
          {
            $group: {
              _id: '$technicianId',
              totalAssignments: { $sum: 1 },
              completedAssignments: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                },
              },
            },
          },
        ])
      : [];

    res.json({
      technician: toPlainTechnician(technicianDoc.toObject(), {
        totalAssignments: assignmentAgg?.totalAssignments || 0,
        completedAssignments: assignmentAgg?.completedAssignments || 0,
      }),
    });
  } catch (error) {
    console.error('Failed to update technician:', error);
    res.status(500).json({ error: 'Failed to update technician.' });
  }
});

const buildServiceFilters = async (query) => {
  const filter = {};
  const status = query.status;
  const category = query.category;
  const priority = query.priority;
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  if (status && status !== 'all') {
    filter.status = status;
  }
  if (category && category !== 'all') {
    filter.category = category;
  }
  if (priority && priority !== 'all') {
    filter.priority = priority;
  }

  if (!search) {
    return filter;
  }

  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

  const matchingUsers = await User.find(
    {
      $or: [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { city: regex },
        { publicId: regex },
      ],
    },
    '_id'
  ).lean();

  const userIds = matchingUsers.map((user) => user._id);

  filter.$or = [
    { title: regex },
    { description: regex },
    { locationAddress: regex },
  ];

  if (userIds.length > 0) {
    filter.$or.push({ customerId: { $in: userIds } }, { technicianId: { $in: userIds } });
  }

  return filter;
};

router.get('/services', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const { limit, page, skip } = parsePagination(req);
    const filters = await buildServiceFilters(req.query || {});

    const query = ServiceRequest.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'fullName email phone')
      .populate('technicianId', 'fullName email phone')
      .lean();

    const [services, total] = await Promise.all([query, ServiceRequest.countDocuments(filters)]);

    const data = services.map((service) => toPlainServiceDetailed(service));

    res.json({
      data,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Failed to list services:', error);
    res.status(500).json({ error: 'Failed to load services.' });
  }
});

router.patch('/services/:id', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid service id.' });
    }

    const payload = req.body || {};
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
      const allowed = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
      if (!allowed.includes(payload.status)) {
        return res.status(400).json({ error: 'Invalid service status.' });
      }
      updates.status = payload.status;
      if (payload.status === 'completed') {
        updates.completionDate = payload.completionDate ? new Date(payload.completionDate) : new Date();
      }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'priority')) {
      const allowedPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!allowedPriorities.includes(payload.priority)) {
        return res.status(400).json({ error: 'Invalid priority level.' });
      }
      updates.priority = payload.priority;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'assignedTechnician')) {
      const technicianId = payload.assignedTechnician;
      if (technicianId && !mongoose.Types.ObjectId.isValid(technicianId)) {
        return res.status(400).json({ error: 'Invalid technician id.' });
      }
      updates.technicianId = technicianId || null;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'finalCost')) {
      const amount = Number(payload.finalCost);
      if (Number.isNaN(amount) || amount < 0) {
        return res.status(400).json({ error: 'Final cost must be a positive number.' });
      }
      updates.finalCost = amount;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    const serviceDoc = await ServiceRequest.findById(id);
    if (!serviceDoc) {
      return res.status(404).json({ error: 'Service request not found.' });
    }

    Object.assign(serviceDoc, updates);
    await serviceDoc.save();

    const populated = await ServiceRequest.findById(serviceDoc._id)
      .populate('customerId', 'fullName email phone')
      .populate('technicianId', 'fullName email phone')
      .lean();

    res.json({
      service: toPlainServiceDetailed(populated),
    });
  } catch (error) {
    console.error('Failed to update service:', error);
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

router.get('/approvals', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const { limit, page, skip } = parsePagination(req);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const baseFilter = { kycStatus: { $in: ['not_submitted', 'under_review'] } };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      const matchingUsers = await User.find(
        { $or: [{ fullName: regex }, { email: regex }, { phone: regex }] },
        '_id'
      ).lean();
      if (matchingUsers.length === 0) {
        baseFilter.userId = { $in: [null] };
      } else {
        baseFilter.userId = { $in: matchingUsers.map((u) => u._id) };
      }
    }

    const [technicians, total] = await Promise.all([
      Technician.find(baseFilter)
        .populate('userId', 'fullName email phone publicId')
        .sort({ kycSubmittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Technician.countDocuments(baseFilter),
    ]);

    res.json({
      data: technicians.map((tech) => toPlainPendingTechnician(tech)),
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Failed to list approvals:', error);
    res.status(500).json({ error: 'Failed to load approvals.' });
  }
});

router.get('/reports', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 6, 1), 24);
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setMonth(startDate.getMonth() - (months - 1));

    const monthlyPipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          totalRevenue: {
            $sum: {
              $cond: [
                { $gt: ['$finalCost', 0] },
                '$finalCost',
                { $ifNull: ['$budgetMax', '$budgetMin'] },
              ],
            },
          },
          totalRequests: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    const statusPipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ];

    const categoryPipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $gt: ['$finalCost', 0] },
                '$finalCost',
                { $ifNull: ['$budgetMax', '$budgetMin'] },
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ];

    const technicianPerformancePipeline = [
      {
        $match: {
          status: 'completed',
          technicianId: { $ne: null },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$technicianId',
          completedJobs: { $sum: 1 },
          avgRating: { $avg: '$reviewRating' },
        },
      },
      { $sort: { completedJobs: -1 } },
      { $limit: 5 },
    ];

    const resolutionPipeline = [
      {
        $match: {
          status: 'completed',
          completionDate: { $ne: null },
          createdAt: { $gte: startDate },
        },
      },
      {
        $project: {
          resolutionHours: {
            $divide: [{ $subtract: ['$completionDate', '$createdAt'] }, 1000 * 60 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionHours: { $avg: '$resolutionHours' },
        },
      },
    ];

    const customerGrowthPipeline = [
      { $match: { role: { $ne: 'admin' }, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    const [
      monthlyAgg,
      statusAgg,
      categoryAgg,
      technicianAgg,
      resolutionAgg,
      customerAgg,
    ] = await Promise.all([
      ServiceRequest.aggregate(monthlyPipeline),
      ServiceRequest.aggregate(statusPipeline),
      ServiceRequest.aggregate(categoryPipeline),
      ServiceRequest.aggregate(technicianPerformancePipeline),
      ServiceRequest.aggregate(resolutionPipeline),
      User.aggregate(customerGrowthPipeline),
    ]);

    const technicianIds = technicianAgg.map((item) => item._id).filter(Boolean);
    let technicianMap = new Map();
    if (technicianIds.length > 0) {
      const technicianUsers = await User.find({ _id: { $in: technicianIds } }, 'fullName email').lean();
      technicianMap = new Map(technicianUsers.map((user) => [user._id.toString(), user]));
    }

    const monthsList = [];
    const iteratorDate = new Date(startDate);
    for (let i = 0; i < months; i += 1) {
      monthsList.push({
        year: iteratorDate.getFullYear(),
        month: iteratorDate.getMonth() + 1,
      });
      iteratorDate.setMonth(iteratorDate.getMonth() + 1);
    }

    const monthlyPerformanceRaw = monthsList.map((entry) => {
      const match = monthlyAgg.find(
        (item) => item._id.year === entry.year && item._id.month === entry.month
      );
      return {
        label: `${entry.month.toString().padStart(2, '0')}/${entry.year}`,
        totalRequests: match?.totalRequests || 0,
        completed: match?.completed || 0,
        revenue: Math.round(match?.totalRevenue || 0),
      };
    });

    const monthlyPerformance = monthlyPerformanceRaw.filter(
      (item) => item.totalRequests > 0 || item.revenue > 0 || item.completed > 0
    );

    const totalRequests = monthlyPerformanceRaw.reduce((sum, item) => sum + item.totalRequests, 0);
    const totalCompleted = monthlyPerformanceRaw.reduce((sum, item) => sum + item.completed, 0);

    res.json({
      range: { months },
      monthlyPerformance,
      statusSummary: statusAgg.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      categorySummary: categoryAgg.map((item) => ({
        category: item._id,
        count: item.count,
        revenue: Math.round(item.revenue || 0),
      })),
      technicianPerformance: technicianAgg.map((item) => {
        const userDoc = technicianMap.get(item._id?.toString() || '');
        return {
          technicianId: item._id,
          name: userDoc?.fullName || userDoc?.email || 'Technician',
          email: userDoc?.email || null,
          completedJobs: item.completedJobs,
          avgRating: item.avgRating ? Number(item.avgRating.toFixed(1)) : null,
        };
      }),
      customerGrowth: customerAgg.map((item) => ({
        label: `${item._id.month.toString().padStart(2, '0')}/${item._id.year}`,
        total: item.total,
      })),
      averages: {
        completionRate: totalRequests ? Number(((totalCompleted / totalRequests) * 100).toFixed(1)) : 0,
        avgResolutionHours: resolutionAgg[0]?.avgResolutionHours
          ? Number(resolutionAgg[0].avgResolutionHours.toFixed(1))
          : null,
      },
    });
  } catch (error) {
    console.error('Failed to load reports:', error);
    res.status(500).json({ error: 'Failed to load analytics reports.' });
  }
});

router.get('/settings', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    await ensureDefaultSettings();
    const settings = await AdminSetting.find().sort({ category: 1, label: 1 }).lean();
    res.json({
      settings: settings.map((setting) => ({
        key: setting.key,
        label: setting.label,
        description: setting.description,
        value: setting.value,
        type: setting.type,
        category: setting.category,
        updatedAt: setting.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Failed to load admin settings:', error);
    res.status(500).json({ error: 'Failed to load admin settings.' });
  }
});

router.put('/settings', authMiddleware, async (req, res) => {
  if (!ensureAdmin(req, res)) return;

  try {
    const updates = Array.isArray(req.body) ? req.body : req.body?.settings;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'No settings provided.' });
    }

    const results = [];
    for (const setting of updates) {
      if (!setting || typeof setting.key !== 'string') continue;

      const update = await AdminSetting.findOneAndUpdate(
        { key: setting.key },
        { value: setting.value, updatedAt: new Date() },
        { new: true, upsert: false }
      ).lean();

      if (update) {
        results.push({
          key: update.key,
          label: update.label,
          description: update.description,
          value: update.value,
          type: update.type,
          category: update.category,
          updatedAt: update.updatedAt,
        });
      }
    }

    res.json({ updated: results });
  } catch (error) {
    console.error('Failed to update admin settings:', error);
    res.status(500).json({ error: 'Failed to update admin settings.' });
  }
});


export default router;
