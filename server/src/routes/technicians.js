import express from 'express';
import jwt from 'jsonwebtoken';
import Technician from '../models/Technician.js';

const router = express.Router();

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    next();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// List technicians (optionally by userId)
router.get('/', auth, async (req, res) => {
  const { userId } = req.query;
  const q = userId ? { userId } : {};
  const list = await Technician.find(q).limit(50).lean();
  res.json(list);
});

// Update technician by id
router.put('/:id', auth, async (req, res) => {
  const update = req.body || {};
  const tech = await Technician.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!tech) return res.status(404).json({ error: 'Not found' });
  res.json(tech);
});

export default router;


