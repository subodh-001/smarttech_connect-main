import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import SupportTicket from '../models/SupportTicket.js';

const router = express.Router();

const optionalAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      req.user = decoded;
    }
  } catch (err) {
    // optional auth ignores invalid tokens
  } finally {
    next();
  }
};

router.post('/tickets', optionalAuth, async (req, res) => {
  try {
    const { name, email, subject, category, priority, message, channel, metadata } = req.body || {};

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    }

    const userId = req.user?.sub && mongoose.Types.ObjectId.isValid(req.user.sub)
      ? new mongoose.Types.ObjectId(req.user.sub)
      : undefined;

    const ticket = await SupportTicket.create({
      userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      category: category || 'other',
      priority: priority || 'medium',
      message: message.trim(),
      channel: channel || 'email',
      metadata,
    });

    res.status(201).json({
      ticket: {
        id: ticket._id.toString(),
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
      },
      message: 'Support request submitted successfully.',
    });
  } catch (error) {
    console.error('Failed to create support ticket', error);
    res.status(500).json({ error: 'Failed to submit support request.' });
  }
});

router.get('/tickets', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.sub && mongoose.Types.ObjectId.isValid(req.user.sub)
      ? new mongoose.Types.ObjectId(req.user.sub)
      : undefined;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to view support tickets.' });
    }

    const tickets = await SupportTicket.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      tickets: tickets.map((ticket) => ({
        id: ticket._id.toString(),
        subject: ticket.subject,
        status: ticket.status,
        category: ticket.category,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Failed to load support tickets', error);
    res.status(500).json({ error: 'Failed to load support tickets.' });
  }
});

export default router;

