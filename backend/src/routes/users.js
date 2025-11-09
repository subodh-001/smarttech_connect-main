import express from 'express';
import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({});
  res.json({
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    address: user.address,
    city: user.city,
    postalCode: user.postalCode,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
});

router.put('/me', authMiddleware, async (req, res) => {
  const update = req.body || {};
  const user = await User.findByIdAndUpdate(req.user.sub, update, { new: true });
  res.json({
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    address: user.address,
    city: user.city,
    postalCode: user.postalCode,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
});

router.get('/me/settings', authMiddleware, async (req, res) => {
  let settings = await UserSettings.findOne({ userId: req.user.sub });
  if (!settings) settings = await UserSettings.create({ userId: req.user.sub });
  res.json(settings);
});

router.put('/me/settings', authMiddleware, async (req, res) => {
  const payload = req.body || {};
  const settings = await UserSettings.findOneAndUpdate(
    { userId: req.user.sub },
    payload,
    { new: true, upsert: true }
  );
  res.json(settings);
});

export default router;


