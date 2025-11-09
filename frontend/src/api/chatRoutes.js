import express from 'express';
import { ChatMessage, ServiceRequest } from '../models/index.js';
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

// Get messages for a specific service request
router.get('/service-request/:serviceRequestId', checkAuth, async (req, res) => {
  try {
    const { serviceRequestId } = req.params;
    const { user } = req;
    
    // Verify the service request exists
    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    
    // Check if user has access to this service request's messages
    if (user.role !== 'admin' && 
        serviceRequest.customerId.toString() !== user.id && 
        serviceRequest.technicianId?.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const messages = await ChatMessage.find({ serviceRequestId })
      .populate('senderId', 'fullName email phone avatarUrl role')
      .sort({ createdAt: 1 });
    
    // Mark messages as read if the user is the recipient
    const unreadMessages = messages.filter(msg => 
      !msg.isRead && msg.senderId.toString() !== user.id
    );
    
    if (unreadMessages.length > 0) {
      await ChatMessage.updateMany(
        { 
          _id: { $in: unreadMessages.map(msg => msg._id) }
        },
        { isRead: true }
      );
    }
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a new message
router.post('/', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const { serviceRequestId, messageText, messageType, attachmentUrl } = req.body;
    
    // Verify the service request exists
    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    
    // Check if user has access to this service request
    if (user.role !== 'admin' && 
        serviceRequest.customerId.toString() !== user.id && 
        serviceRequest.technicianId?.toString() !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Create and save the message
    const message = new ChatMessage({
      serviceRequestId,
      senderId: user.id,
      messageText,
      messageType: messageType || 'text',
      attachmentUrl,
      isRead: false,
      createdAt: new Date()
    });
    
    await message.save();
    
    // Populate sender information for the response
    await message.populate('senderId', 'fullName email phone avatarUrl role');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/mark-read', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const { messageIds } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'Message IDs are required' });
    }
    
    // Verify user has access to these messages
    const messages = await ChatMessage.find({ _id: { $in: messageIds } });
    
    for (const message of messages) {
      const serviceRequest = await ServiceRequest.findById(message.serviceRequestId);
      
      if (!serviceRequest) {
        continue; // Skip if service request not found
      }
      
      // Check if user has access to this message
      if (user.role !== 'admin' && 
          serviceRequest.customerId.toString() !== user.id && 
          serviceRequest.technicianId?.toString() !== user.id) {
        return res.status(403).json({ error: 'Access denied to one or more messages' });
      }
    }
    
    // Mark messages as read
    await ChatMessage.updateMany(
      { _id: { $in: messageIds } },
      { isRead: true }
    );
    
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread message count
router.get('/unread-count', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    
    // Get all service requests the user has access to
    let serviceRequests;
    if (user.role === 'admin') {
      serviceRequests = await ServiceRequest.find();
    } else if (user.role === 'customer') {
      serviceRequests = await ServiceRequest.find({ customerId: user.id });
    } else if (user.role === 'technician') {
      serviceRequests = await ServiceRequest.find({ technicianId: user.id });
    }
    
    const serviceRequestIds = serviceRequests.map(sr => sr._id);
    
    // Count unread messages
    const unreadCount = await ChatMessage.countDocuments({
      serviceRequestId: { $in: serviceRequestIds },
      senderId: { $ne: user.id },
      isRead: false
    });
    
    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;