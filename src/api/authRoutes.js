import express from 'express';
import { registerUser, loginUser, getCurrentUser } from '../lib/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    const result = await registerUser(userData);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = await getCurrentUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;