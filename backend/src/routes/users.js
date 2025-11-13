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
    addresses: user.addresses || [],
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

    // Validate addresses array if provided
    if (update.addresses !== undefined) {
      if (!Array.isArray(update.addresses)) {
        return res.status(400).json({ error: 'Addresses must be an array' });
      }
      
      // Validate each address in the array
      for (let i = 0; i < update.addresses.length; i++) {
        const addr = update.addresses[i];
        if (!addr || typeof addr !== 'object') {
          return res.status(400).json({ error: `Address at index ${i} must be an object` });
        }
        
        // Check required fields
        if (!addr.id || typeof addr.id !== 'string') {
          return res.status(400).json({ error: `Address at index ${i} must have a valid id (string)` });
        }
        if (!addr.label || typeof addr.label !== 'string') {
          return res.status(400).json({ error: `Address at index ${i} must have a label` });
        }
        if (!addr.street || typeof addr.street !== 'string') {
          return res.status(400).json({ error: `Address at index ${i} must have a street` });
        }
        if (!addr.city || typeof addr.city !== 'string') {
          return res.status(400).json({ error: `Address at index ${i} must have a city` });
        }
        if (!addr.state || typeof addr.state !== 'string') {
          return res.status(400).json({ error: `Address at index ${i} must have a state` });
        }
        if (!addr.zipCode || typeof addr.zipCode !== 'string') {
          return res.status(400).json({ error: `Address at index ${i} must have a zipCode` });
        }
        
        // Validate coordinates if provided (optional but should be valid if present)
        if (addr.coordinates !== undefined && addr.coordinates !== null) {
          if (typeof addr.coordinates !== 'object') {
            return res.status(400).json({ error: `Address at index ${i} coordinates must be an object` });
          }
          if (addr.coordinates.lat !== undefined && (typeof addr.coordinates.lat !== 'number' || isNaN(addr.coordinates.lat))) {
            return res.status(400).json({ error: `Address at index ${i} coordinates.lat must be a valid number` });
          }
          if (addr.coordinates.lng !== undefined && (typeof addr.coordinates.lng !== 'number' || isNaN(addr.coordinates.lng))) {
            return res.status(400).json({ error: `Address at index ${i} coordinates.lng must be a valid number` });
          }
        }
        
        // Validate isDefault (should be boolean)
        if (addr.isDefault !== undefined && typeof addr.isDefault !== 'boolean') {
          return res.status(400).json({ error: `Address at index ${i} isDefault must be a boolean` });
        }
      }
    }

    // Only allow specific fields to be updated
    const allowedFields = ['fullName', 'phone', 'avatarUrl', 'address', 'city', 'state', 'postalCode', 'addresses'];
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
      addresses: user.addresses || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map(err => err.message).join(', ');
      return res.status(400).json({ 
        error: `Validation error: ${validationErrors}` 
      });
    }
    
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


