import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import technicianRoutes from './routes/technicians.js';
import User from './models/User.js';
import Technician from './models/Technician.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// MongoDB connection
const connectMongo = async () => {
  try {
    mongoose.set('strictQuery', true);
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected');
      return;
    }
    // Fallback to in-memory server if no URI provided or connection fails
    const mem = await MongoMemoryServer.create();
    const memUri = mem.getUri();
    await mongoose.connect(memUri);
    console.log('MongoDB (in-memory) connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

await connectMongo();

// Seed demo users for quick login (no OTP)
const ensureDemoUsers = async () => {
  const upsertUser = async (email, password, role, extra = {}) => {
    let user = await User.findOne({ email });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({ email, passwordHash, role, fullName: extra.fullName || role.toUpperCase() + ' Demo' });
    }
    return user;
  };

  const user = await upsertUser('demo.user@example.com', 'Demo@12345', 'user', { fullName: 'Demo User' });
  const tech = await upsertUser('demo.tech@example.com', 'Demo@12345', 'technician', { fullName: 'Demo Technician' });
  const admin = await upsertUser('demo.admin@example.com', 'Demo@12345', 'admin', { fullName: 'Demo Admin' });

  // Ensure technician profile exists for technician user
  if (tech) {
    const existingTech = await Technician.findOne({ userId: tech._id });
    if (!existingTech) {
      await Technician.create({
        userId: tech._id,
        specialties: ['electrical'],
        yearsOfExperience: 3,
        hourlyRate: 25,
        averageRating: 4.6,
        totalJobs: 12,
        bio: 'Skilled technician for demo.',
        certifications: ['Certified Pro'],
        serviceRadius: 15,
        currentStatus: 'available'
      });
    }
  }
  console.log('Demo users ready');
};

await ensureDemoUsers();

// Health
app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState; // 1 connected, 2 connecting
  res.json({ status: 'ok', mongo: state === 1 ? 'connected' : 'not_connected', state });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/technicians', technicianRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend listening on port ${port}`));


