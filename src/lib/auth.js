import jwt from 'jsonwebtoken';
import { User, UserSetting } from '../models/index.js';

const JWT_SECRET = import.meta.env?.VITE_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT secret environment variable. Please check your .env file for VITE_JWT_SECRET');
}

/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User document from MongoDB
 * @returns {String} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} User object and token
 */
export const registerUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const user = new User({
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      role: userData.role || 'customer',
      phone: userData.phone,
      avatarUrl: userData.avatarUrl,
      address: userData.address,
      city: userData.city,
      postalCode: userData.postalCode
    });

    await user.save();

    // Create default user settings
    const userSettings = new UserSetting({
      userId: user._id
    });

    await userSettings.save();

    // Generate token
    const token = generateToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User object and token
 */
export const loginUser = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Generate token
    const token = generateToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user from token
 * @param {String} token - JWT token
 * @returns {Object} User object
 */
export const getCurrentUser = async (token) => {
  try {
    if (!token) {
      return null;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user by id
    const user = await User.findById(decoded.id);
    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };
  } catch (error) {
    return null;
  }
};

/**
 * Authentication middleware
 * @param {Object} req - Request object
 * @returns {Object} Current user or null
 */
export const authMiddleware = async (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return null;
    }

    return await getCurrentUser(token);
  } catch (error) {
    return null;
  }
};