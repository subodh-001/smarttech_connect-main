import express from 'express';
import { User, UserSetting } from '../models/index.js';
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

// Get current user profile
router.get('/me', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    
    const userProfile = await User.findById(user.id).select('-password');
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user settings
router.get('/me/settings', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    
    let userSettings = await UserSetting.findOne({ userId: user.id });
    
    if (!userSettings) {
      // Create default settings if none exist
      userSettings = new UserSetting({
        userId: user.id,
        notificationsEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        languagePreference: 'en',
        timezone: 'UTC',
        privacyLevel: 'standard'
      });
      await userSettings.save();
    }
    
    res.status(200).json(userSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/me', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const updateData = req.body;
    
    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.email; // Email updates should be handled separately with verification
    delete updateData.role; // Role updates should be handled separately
    
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user settings
router.put('/me/settings', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const updateData = req.body;
    
    let userSettings = await UserSetting.findOne({ userId: user.id });
    
    if (!userSettings) {
      // Create settings if none exist
      userSettings = new UserSetting({
        userId: user.id,
        ...updateData
      });
    } else {
      // Update existing settings
      Object.assign(userSettings, updateData);
    }
    
    await userSettings.save();
    
    res.status(200).json(userSettings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change password
router.put('/me/password', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    const userDoc = await User.findById(user.id);
    
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await userDoc.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    userDoc.password = newPassword;
    await userDoc.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin routes

// Get all users (admin only)
router.get('/', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const users = await User.find().select('-password');
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID (admin only)
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    
    // Check if user is admin or requesting their own profile
    if (user.role !== 'admin' && user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const userProfile = await User.findById(id).select('-password');
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user by ID (admin only)
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Prevent updating password through this route
    delete updateData.password;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Prevent deleting self
    if (user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete related user settings
    await UserSetting.deleteOne({ userId: id });
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;