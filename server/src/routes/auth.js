import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const signToken = (user) => {
  const payload = { sub: user._id, role: user.role, email: user.email };
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, fullName });
  const token = signToken(user);
  res.json({ user: { _id: user._id, email: user.email, role: user.role }, token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ user: { _id: user._id, email: user.email, role: user.role }, token });
});

router.post('/logout', (req, res) => {
  res.json({ ok: true });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({});
  res.json({ user: { _id: user._id, email: user.email, role: user.role, fullName: user.fullName, phone: user.phone, avatarUrl: user.avatarUrl, isActive: user.isActive, address: user.address, city: user.city, postalCode: user.postalCode, createdAt: user.createdAt, updatedAt: user.updatedAt } });
});

export default router;


