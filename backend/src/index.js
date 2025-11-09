import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';

import bcrypt from 'bcryptjs';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import technicianRoutes from './routes/technicians.js';
import serviceRequestRoutes from './routes/serviceRequests.js';
import dashboardRoutes from './routes/dashboard.js';
import helpCenterRoutes from './routes/helpCenter.js';
import supportRoutes from './routes/support.js';
import User from './models/User.js';
import Technician from './models/Technician.js';
import ServiceRequest from './models/ServiceRequest.js';
import { ensureHelpCenterSeed } from './seeders/helpCenterSeeder.js';

dotenv.config();

const app = express();
app.set('etag', false); // disable ETag to avoid stale 304 responses for API clients
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

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
        currentStatus: 'available',
        kycStatus: 'not_submitted',
      });
    } else {
      existingTech.kycStatus = existingTech.kycStatus || 'not_submitted';
      if (existingTech.kycStatus !== 'approved') {
        existingTech.kycGovernmentDocumentPath = undefined;
        existingTech.kycGovernmentDocumentOriginalName = undefined;
        existingTech.kycSelfieDocumentPath = undefined;
        existingTech.kycSelfieDocumentOriginalName = undefined;
        existingTech.kycSubmittedAt = undefined;
        existingTech.kycReviewedAt = undefined;
        existingTech.kycFeedback = undefined;
      }
      await existingTech.save();
    }
  }

  // Seed sample service requests
  const existingRequests = await ServiceRequest.countDocuments();
  if (existingRequests === 0 && user) {
    const technicianUser = tech || (await User.findOne({ role: 'technician' }));

    const requests = [
      {
        customerId: user._id,
        technicianId: technicianUser?._id,
        category: 'electrical',
        title: 'Living room wiring issue',
        description: 'Lights flickering intermittently. Need inspection and fix.',
        priority: 'high',
        status: 'in_progress',
        scheduledDate: new Date(Date.now() + 30 * 60 * 1000),
        estimatedDuration: 60,
        budgetMin: 500,
        budgetMax: 1200,
        locationAddress: 'Koramangala 5th Block, Bangalore',
        locationCoordinates: { lat: 12.9352, lng: 77.6245 },
      },
      {
        customerId: user._id,
        technicianId: technicianUser?._id,
        category: 'plumbing',
        title: 'Kitchen sink leakage',
        description: 'Water leakage from sink pipe. Requires urgent fix.',
        priority: 'urgent',
        status: 'confirmed',
        scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        estimatedDuration: 90,
        budgetMin: 700,
        budgetMax: 1500,
        locationAddress: 'HSR Layout Sector 2, Bangalore',
        locationCoordinates: { lat: 12.9121, lng: 77.6446 },
      },
      {
        customerId: user._id,
        technicianId: technicianUser?._id,
        category: 'appliance_repair',
        title: 'Air conditioner not cooling',
        description: 'AC unit produces warm air and needs servicing.',
        priority: 'medium',
        status: 'completed',
        scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        estimatedDuration: 120,
        budgetMin: 1000,
        budgetMax: 2500,
        finalCost: 2200,
        reviewRating: 5,
        locationAddress: 'BTM Layout 1st Stage, Bangalore',
        locationCoordinates: { lat: 12.9166, lng: 77.6101 },
      },
    ];

    await ServiceRequest.insertMany(requests);
  }

  console.log('Demo users ready');
};

await ensureDemoUsers();
await ensureHelpCenterSeed();

// Health
app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState; // 1 connected, 2 connecting
  res.json({ status: 'ok', mongo: state === 1 ? 'connected' : 'not_connected', state });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/help-center', helpCenterRoutes);
app.use('/api/support', supportRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Backend listening on port ${port}`));


