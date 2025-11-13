import express from 'express';
import bcrypt from 'bcryptjs';
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
    passwordChangedAt: user.passwordChangedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const update = req.body || {};
    
    // Validate avatarUrl if provided (should be base64 data URL or empty string)
    if (update.avatarUrl !== undefined) {
      if (update.avatarUrl && typeof update.avatarUrl !== 'string') {
        return res.status(400).json({ error: 'avatarUrl must be a string' });
      }
      // Limit base64 size to 3MB (approximately 2.25MB raw image becomes ~3MB base64)
      // Base64 encoding increases size by ~33%, so 2MB raw = ~2.67MB base64
      if (update.avatarUrl && update.avatarUrl.length > 3145728) {
        return res.status(400).json({ error: 'Image size too large. Please use an image smaller than 2MB.' });
      }
    }

    // Only allow specific fields to be updated
    const allowedFields = ['fullName', 'phone', 'avatarUrl', 'address', 'city', 'state', 'postalCode'];
    const filteredUpdate = {};
    for (const key of allowedFields) {
      if (update[key] !== undefined) {
        filteredUpdate[key] = update[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $set: filteredUpdate },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update user profile. Please try again.' 
    });
  }
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

// Change password
router.put('/me/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({ error: 'New password must contain uppercase, lowercase, and number' });
    }
    
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash and update new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.passwordChangedAt = new Date(); // Set password changed timestamp
    await user.save();
    
    res.json({ 
      message: 'Password updated successfully',
      passwordChangedAt: user.passwordChangedAt
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to change password. Please try again.' 
    });
  }
});

export default router;


