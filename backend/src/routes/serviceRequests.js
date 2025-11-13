import express from 'express';
import ServiceRequest from '../models/ServiceRequest.js';
import Technician from '../models/Technician.js';
import authMiddleware from '../middleware/auth.js';
import { findAvailableTechnicians } from '../services/technicianMatching.js';

const router = express.Router();

const fallbackAvatar = (name = 'User') =>
  `https://ui-avatars.com/api/?background=2563EB&color=fff&name=${encodeURIComponent(name)}`;

const toPlain = (doc) => (doc?.toObject ? doc.toObject({ virtuals: true }) : doc);

const capitalize = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const buildBookingSummary = (rawDoc) => {
  const doc = toPlain(rawDoc);
  const scheduledDate = doc.scheduledDate ? new Date(doc.scheduledDate) : null;

  return {
    id: doc._id ? doc._id.toString() : undefined,
    serviceType: doc.title || capitalize(doc.category || ''),
    category: doc.category,
    status: doc.status,
    scheduledDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : null,
    scheduledTime: scheduledDate ? scheduledDate.toISOString().slice(11, 16) : null,
    budget: doc.finalCost ?? doc.budgetMax ?? doc.budgetMin ?? null,
    budgetMin: doc.budgetMin ?? null,
    budgetMax: doc.budgetMax ?? null,
    priority: doc.priority,
    description: doc.description,
    location: {
      address: doc.locationAddress,
      city: doc.requirements?.city || null,
      state: doc.requirements?.state || null,
      postalCode: doc.requirements?.postalCode || null,
      lat: doc.locationCoordinates?.lat ?? null,
      lng: doc.locationCoordinates?.lng ?? null,
    },
  };
};

const formatMessage = (messageDoc) => {
  if (!messageDoc) return null;
  const message = toPlain(messageDoc);
  const senderDoc = message.senderId || {};
  const senderId = senderDoc._id
    ? senderDoc._id.toString()
    : typeof message.senderId === 'string'
    ? message.senderId
    : message.senderId?.toString?.();
  const senderName = senderDoc.fullName || senderDoc.email || message.metadata?.senderName || 'User';

  return {
    id: message._id ? message._id.toString() : undefined,
    sender: {
      id: senderId,
      role: senderDoc.role || message.senderRole || 'user',
      name: senderName,
      avatar:
        senderDoc.avatarUrl || message.metadata?.senderAvatar || fallbackAvatar(senderName),
    },
    type: message.contentType || 'text',
    content: message.content || '',
    metadata: message.metadata || {},
    deliveryStatus: message.deliveryStatus || 'sent',
    createdAt: message.createdAt || new Date(),
  };
};

const getObjectIdString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  if (typeof value.toString === 'function') return value.toString();
  return null;
};

const userCanAccessRequest = (user, requestDoc) => {
  if (!user || !requestDoc) return false;
  if (user.role === 'admin') return true;
  const customerId = getObjectIdString(requestDoc.customerId);
  const technicianId = getObjectIdString(requestDoc.technicianId);
  if (user.role === 'technician') {
    return technicianId && technicianId === user.sub;
  }
  if (user.role === 'user') {
    return customerId && customerId === user.sub;
  }
  return false;
};

const ensureRequestAccess = (req, res, requestDoc) => {
  if (!userCanAccessRequest(req.user, requestDoc)) {
    res.status(403).json({ error: 'You do not have permission to access this service request.' });
    return false;
  }
  return true;
};

const formatConversation = (requestDoc, { currentUserId, role, technicianProfiles }) => {
  const doc = toPlain(requestDoc);
  const customer = doc.customerId || {};
  const technician = doc.technicianId || {};
  const isTechnicianView = role === 'technician';

  const participantUser = isTechnicianView ? customer : technician;
  const participantName = participantUser.fullName || participantUser.email || (isTechnicianView ? 'Customer' : 'Technician');

  let participantStatus = 'online';
  let participantRating = null;
  let participantCompletedJobs = null;
  let participantLastSeen = participantUser.updatedAt || doc.updatedAt;

  if (!isTechnicianView && technician?._id) {
    const profile = technicianProfiles.get(technician._id.toString());
    if (profile) {
      participantStatus =
        profile.currentStatus === 'available'
          ? 'online'
          : profile.currentStatus === 'busy'
          ? 'away'
          : 'offline';
      participantRating = profile.averageRating ?? null;
      participantCompletedJobs = profile.totalJobs ?? null;
      participantLastSeen = profile.updatedAt || participantLastSeen;
    }
  }

  const lastMessageRaw = Array.isArray(doc.messages) && doc.messages.length
    ? doc.messages[doc.messages.length - 1]
    : null;
  const lastMessage = formatMessage(lastMessageRaw);

  const unreadCount = Array.isArray(doc.messages)
    ? doc.messages.filter((msg) => {
        const senderId =
          msg.senderId && msg.senderId._id
            ? msg.senderId._id.toString()
            : msg.senderId?.toString?.();
        return senderId && senderId !== currentUserId && msg.deliveryStatus !== 'read';
      }).length
    : 0;

  return {
    id: doc._id ? doc._id.toString() : undefined,
    participant: {
      id: participantUser._id ? participantUser._id.toString() : null,
      name: participantName,
      fullName: participantUser.fullName || null,
      email: participantUser.email || null,
      phone: participantUser.phone || null,
      avatar: participantUser.avatarUrl || fallbackAvatar(participantName),
      role: isTechnicianView ? 'user' : 'technician',
      status: participantStatus,
      rating: participantRating,
      completedJobs: participantCompletedJobs,
      lastSeen: participantLastSeen,
    },
    booking: buildBookingSummary(doc),
    lastMessage: lastMessage
      ? {
          id: lastMessage.id,
          senderId: lastMessage.sender?.id,
          senderName: lastMessage.sender?.name,
          content: lastMessage.content,
          type: lastMessage.type,
          metadata: lastMessage.metadata,
          timestamp: lastMessage.createdAt,
          deliveryStatus: lastMessage.deliveryStatus,
        }
      : null,
    unreadCount,
    updatedAt: doc.updatedAt,
  };
};

const formatComment = (commentDoc) => {
  if (!commentDoc) return null;
  const comment = toPlain(commentDoc);
  const authorDoc = comment.authorId || {};
  const authorId =
    authorDoc._id?.toString?.() ||
    (typeof comment.authorId === 'string' ? comment.authorId : comment.authorId?.toString?.());
  const name = authorDoc.fullName || authorDoc.email || (comment.authorRole === 'admin' ? 'Admin' : 'Technician');

  return {
    id: comment._id ? comment._id.toString() : undefined,
    body: comment.body || '',
    createdAt: comment.createdAt || new Date(),
    author: {
      id: authorId,
      code: authorDoc.publicId || null,
      name,
      role: comment.authorRole || authorDoc.role || 'technician',
      avatar: authorDoc.avatarUrl || fallbackAvatar(name),
    },
    attachments: Array.isArray(comment.attachments) ? comment.attachments : [],
  };
};

const formatServiceRequest = (request) => {
  const doc = toPlain(request);
  const technicianUser = doc.technicianId || doc.technician;
  const customerUser = doc.customerId || doc.customer;

  return {
    id: doc._id ? doc._id.toString() : undefined,
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
    paymentStatus: doc.paymentStatus || 'pending',
    paymentMethod: doc.paymentMethod || null,
    paymentNotes: doc.paymentNotes || null,
    paymentConfirmedAt: doc.paymentConfirmedAt || null,
    reviewRating: doc.reviewRating,
    reviewComment: doc.reviewComment,
    cancellationReason: doc.cancellationReason,
    locationAddress: doc.locationAddress,
    locationCoordinates: doc.locationCoordinates,
    images: doc.images || [],
    requirements: doc.requirements || {},
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    customer: customerUser
      ? {
          id: customerUser._id ? customerUser._id.toString() : undefined,
          code: customerUser.publicId || null,
          name: customerUser.fullName || customerUser.email,
          email: customerUser.email,
          phone: customerUser.phone,
          address: customerUser.address || null,
          city: customerUser.city || null,
          state: customerUser.state || null,
          postalCode: customerUser.postalCode || null,
          addresses: customerUser.addresses || [],
        }
      : null,
    technician: technicianUser
      ? {
          id: technicianUser._id ? technicianUser._id.toString() : undefined,
          code: technicianUser.publicId || null,
          name: technicianUser.fullName || technicianUser.email,
          email: technicianUser.email,
          phone: technicianUser.phone,
          avatar: technicianUser.avatarUrl,
          rating: technicianUser.averageRating || null,
          experience: technicianUser.yearsOfExperience || null,
          specialization: Array.isArray(technicianUser.specialties) && technicianUser.specialties.length > 0
            ? technicianUser.specialties.join(', ')
            : null,
        }
      : null,
    technicianComments: Array.isArray(doc.technicianComments)
      ? doc.technicianComments.map(formatComment).filter(Boolean)
      : [],
  };
};

router.get('/available', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'technician') {
      return res.status(403).json({ error: 'Only technicians can view available requests' });
    }

    const technicianId = req.user.sub;
    const requests = await ServiceRequest.find({
      status: { $in: ['pending'] },
      $or: [
        { technicianId: { $exists: false } },
        { technicianId: null },
        { technicianId },
      ],
    })
      .populate('customerId', 'fullName email phone publicId address city state postalCode addresses')
      .populate('technicianComments.authorId', 'fullName email avatarUrl role publicId')
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
      if (req.query.customerId) filter.customerId = req.query.customerId;
      if (req.query.technicianId) filter.technicianId = req.query.technicianId;
    } else {
      filter.customerId = sub;
    }

    if (status) {
      filter.status = status;
    }

    const requests = await ServiceRequest.find(filter)
      .populate('technicianId', 'fullName email phone avatarUrl publicId')
      .populate('customerId', 'fullName email phone publicId address city state postalCode addresses')
      .populate('technicianComments.authorId', 'fullName email avatarUrl role publicId')
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
      .populate('technicianId', 'fullName email phone avatarUrl publicId')
      .populate('customerId', 'fullName email phone publicId');

    const location = populated.locationCoordinates || {};
    const matching = await findAvailableTechnicians({
      category: populated.category,
      lat: typeof location.lat === 'number' ? location.lat : undefined,
      lng: typeof location.lng === 'number' ? location.lng : undefined,
      radiusInKm: payload.radiusInKm || undefined,
      limit: 25,
    });

    res.status(201).json({
      request: formatServiceRequest(populated),
      matchingTechnicians: matching.technicians,
      matchingSummary: matching.summary,
    });
  } catch (error) {
    console.error('Failed to create service request:', error);
    res.status(500).json({ error: 'Failed to create service request' });
  }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      finalCost,
      technicianId,
      scheduledDate,
      locationAddress,
      locationCoordinates,
      reviewRating,
      reviewComment,
      cancellationReason,
      rescheduleReason,
    } = req.body || {};

    const request = await ServiceRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (status) request.status = status;
    if (finalCost !== undefined) request.finalCost = Number(finalCost);
    if (technicianId) request.technicianId = technicianId;

    if (scheduledDate !== undefined) {
      request.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    }

    if (locationAddress !== undefined) {
      request.locationAddress = locationAddress;
    }

    if (
      locationCoordinates &&
      typeof locationCoordinates.lat === 'number' &&
      typeof locationCoordinates.lng === 'number'
    ) {
      request.locationCoordinates = {
        lat: Number(locationCoordinates.lat),
        lng: Number(locationCoordinates.lng),
      };
    }

    if (reviewRating !== undefined) {
      request.reviewRating = Number(reviewRating);
    }

    if (reviewComment !== undefined) {
      request.reviewComment = reviewComment;
    }

    if (cancellationReason !== undefined) {
      request.cancellationReason = cancellationReason;
    }

    if (rescheduleReason !== undefined) {
      const existingRequirements =
        (request.requirements && typeof request.requirements === 'object'
          ? request.requirements
          : {}) || {};
      request.requirements = {
        ...existingRequirements,
        rescheduleReason,
      };
    }

    // Payment status updates
    if (req.body.paymentStatus !== undefined) {
      const allowedPaymentStatuses = ['pending', 'awaiting_payment', 'paid', 'failed'];
      if (allowedPaymentStatuses.includes(req.body.paymentStatus)) {
        request.paymentStatus = req.body.paymentStatus;
        if (req.body.paymentStatus === 'paid') {
          request.paymentConfirmedAt = new Date();
        }
      }
    }

    if (req.body.paymentMethod !== undefined) {
      request.paymentMethod = typeof req.body.paymentMethod === 'string' ? req.body.paymentMethod.trim() : null;
    }

    if (req.body.paymentNotes !== undefined) {
      request.paymentNotes = typeof req.body.paymentNotes === 'string' ? req.body.paymentNotes.trim() : null;
    }

    if (status === 'completed') {
      request.completionDate = new Date();
    }
    await request.save();

    const populated = await ServiceRequest.findById(id)
      .populate('technicianId', 'fullName email phone avatarUrl publicId')
      .populate('customerId', 'fullName email phone publicId');

    res.json(formatServiceRequest(populated));
  } catch (error) {
    console.error('Failed to update service request:', error);
    res.status(500).json({ error: 'Failed to update service request' });
  }
});

router.get('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await ServiceRequest.findById(id)
      .populate('technicianComments.authorId', 'fullName email avatarUrl role publicId')
      .populate('customerId', 'fullName email phone publicId')
      .populate('technicianId', 'fullName email phone avatarUrl publicId');

    if (!request) {
      return res.status(404).json({ error: 'Service request not found.' });
    }

    if (!ensureRequestAccess(req, res, request)) return;

    res.json({ comments: (request.technicianComments || []).map(formatComment) });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    res.status(500).json({ error: 'Failed to fetch service request comments.' });
  }
});

router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body || {};
    const trimmed = (body || '').trim();

    if (!trimmed) {
      return res.status(400).json({ error: 'Comment body is required.' });
    }

    const request = await ServiceRequest.findById(id)
      .populate('technicianComments.authorId', 'fullName email avatarUrl role publicId')
      .populate('customerId', 'fullName email phone publicId')
      .populate('technicianId', 'fullName email phone avatarUrl publicId');

    if (!request) {
      return res.status(404).json({ error: 'Service request not found.' });
    }

    if (!ensureRequestAccess(req, res, request)) return;

    const { role, sub } = req.user;

    if (role !== 'technician' && role !== 'admin') {
      return res.status(403).json({ error: 'Only technicians or admins can post comments.' });
    }

    if (role === 'technician') {
      const technicianId = getObjectIdString(request.technicianId);
      if (!technicianId || technicianId !== sub) {
        return res.status(403).json({ error: 'Only the assigned technician can comment.' });
      }
    }

    request.technicianComments.push({
      authorId: sub,
      authorRole: role === 'admin' ? 'admin' : 'technician',
      body: trimmed,
      attachments: [],
    });

    await request.save();
    await request.populate('technicianComments.authorId', 'fullName email avatarUrl role publicId');

    res.status(201).json({ comments: (request.technicianComments || []).map(formatComment) });
  } catch (error) {
    console.error('Failed to post comment:', error);
    res.status(500).json({ error: 'Failed to post comment.' });
  }
});

router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const { role, sub } = req.user;
    const filter = {};

    if (role === 'technician') {
      filter.technicianId = sub;
    } else if (role === 'admin') {
      if (req.query.customerId) filter.customerId = req.query.customerId;
      if (req.query.technicianId) filter.technicianId = req.query.technicianId;
    } else {
      filter.customerId = sub;
    }

    const requests = await ServiceRequest.find(filter)
      .select({
        category: 1,
        title: 1,
        description: 1,
        priority: 1,
        status: 1,
        scheduledDate: 1,
        budgetMin: 1,
        budgetMax: 1,
        finalCost: 1,
        locationAddress: 1,
        locationCoordinates: 1,
        requirements: 1,
        updatedAt: 1,
        createdAt: 1,
        customerId: 1,
        technicianId: 1,
        messages: 1,
      })
      .populate('customerId', 'fullName email phone avatarUrl updatedAt publicId')
      .populate('technicianId', 'fullName email phone avatarUrl updatedAt publicId')
      .populate('messages.senderId', 'fullName email avatarUrl role')
      .sort({ updatedAt: -1 });

    const technicianUserIds = requests
      .map((reqDoc) => reqDoc.technicianId?._id || reqDoc.technicianId)
      .filter(Boolean)
      .map((id) => id.toString());

    const technicianProfiles = await Technician.find({ userId: { $in: technicianUserIds } }).lean();
    const technicianProfileMap = new Map(
      technicianProfiles.map((profile) => [profile.userId.toString(), profile])
    );

    const conversations = requests.map((reqDoc) =>
      formatConversation(reqDoc, {
        currentUserId: sub,
        role,
        technicianProfiles: technicianProfileMap,
      })
    );

    res.json(conversations);
  } catch (error) {
    console.error('Failed to load conversations:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, sub } = req.user;

    const request = await ServiceRequest.findById(id)
      .populate('customerId', 'fullName email phone avatarUrl updatedAt publicId')
      .populate('technicianId', 'fullName email phone avatarUrl updatedAt publicId')
      .populate('messages.senderId', 'fullName email avatarUrl role')
      .lean();

    if (!request) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const customerId = request.customerId?._id?.toString?.() || request.customerId?.toString?.();
    const technicianId = request.technicianId?._id?.toString?.() || request.technicianId?.toString?.();

    if (
      role === 'user' && customerId !== sub && role !== 'admin'
    ) {
      return res.status(403).json({ error: 'You are not allowed to view this conversation' });
    }

    if (
      role === 'technician' && technicianId !== sub && role !== 'admin'
    ) {
      return res.status(403).json({ error: 'You are not allowed to view this conversation' });
    }

    const formattedMessages = (request.messages || []).map((message) => formatMessage(message));

    const unreadIds = (request.messages || [])
      .filter((msg) => {
        const senderId =
          msg.senderId && msg.senderId._id
            ? msg.senderId._id.toString()
            : msg.senderId?.toString?.();
        return senderId && senderId !== sub && msg.deliveryStatus !== 'read';
      })
      .map((msg) => msg._id);

    if (unreadIds.length) {
      await ServiceRequest.updateOne(
        { _id: id },
        { $set: { 'messages.$[elem].deliveryStatus': 'read' } },
        { arrayFilters: [{ 'elem._id': { $in: unreadIds } }] }
      );
    }

    const unreadIdStrings = unreadIds.map((item) => item.toString());

    const sortedMessages = formattedMessages
      .map((message) =>
        unreadIdStrings.includes(message.id)
          ? { ...message, deliveryStatus: 'read' }
          : message
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({
      serviceRequest: {
        id: request._id.toString(),
        booking: buildBookingSummary(request),
      },
      messages: sortedMessages,
    });
  } catch (error) {
    console.error('Failed to load messages:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, sub } = req.user;
    const { type = 'text', content = '', metadata = {} } = req.body || {};

    if (!['text', 'image', 'location', 'booking_update'].includes(type)) {
      return res.status(400).json({ error: 'Unsupported message type.' });
    }

    if (type === 'text' && (!content || !content.trim())) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const request = await ServiceRequest.findById(id)
      .populate('customerId', 'fullName email phone avatarUrl publicId')
      .populate('technicianId', 'fullName email phone avatarUrl publicId');

    if (!request) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const customerId = request.customerId?._id?.toString?.() || request.customerId?.toString?.();
    const technicianId = request.technicianId?._id?.toString?.() || request.technicianId?.toString?.();

    if (role === 'user' && customerId !== sub && role !== 'admin') {
      return res.status(403).json({ error: 'You are not allowed to post messages here.' });
    }

    if (role === 'technician' && technicianId !== sub && role !== 'admin') {
      return res.status(403).json({ error: 'You are not allowed to post messages here.' });
    }

    const message = {
      senderId: sub,
      senderRole: role === 'admin' ? 'admin' : role,
      contentType: type,
      content: typeof content === 'string' ? content : '',
      metadata: metadata || {},
      deliveryStatus: 'sent',
      createdAt: new Date(),
    };

    request.messages.push(message);
    request.updatedAt = new Date();
    await request.save();
    await request.populate('messages.senderId', 'fullName email avatarUrl role');

    const savedMessage = request.messages[request.messages.length - 1];
    const formattedMessage = formatMessage(savedMessage);

    res.status(201).json({ message: formattedMessage });
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await ServiceRequest.findById(id)
      .populate('technicianId', 'fullName email phone avatarUrl publicId averageRating yearsOfExperience specialties')
      .populate('customerId', 'fullName email phone publicId address city state postalCode addresses')
      .populate('technicianComments.authorId', 'fullName email avatarUrl role publicId');
    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    // Check access permissions
    if (!ensureRequestAccess(req, res, request)) return;

    res.json(formatServiceRequest(request));
  } catch (error) {
    console.error('Failed to fetch service request:', error);
    res.status(500).json({ error: 'Failed to fetch service request' });
  }
});

export default router;


