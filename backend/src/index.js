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
import adminRoutes from './routes/admin.js';
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

const shouldSeedDemoData = process.env.ENABLE_DEMO_SEED === 'true';
const DEMO_EMAILS = [
  'demo.user@example.com',
  'demo.admin@example.com',
  'demo.tech@example.com',
  'rahul.hvac@example.com',
  'neha.plumber@example.com',
  'arjun.carpenter@example.com',
  'fatima.cleaning@example.com',
];

// Seed demo users for quick login (no OTP)
const ensureDemoUsers = async () => {
  const upsertUser = async (email, password, role, extra = {}) => {
    let user = await User.findOne({ email });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        passwordHash,
        role,
        fullName: extra.fullName || role.toUpperCase() + ' Demo',
        phone: extra.phone,
      });
    } else {
      let modified = false;
      if (role && user.role !== role) {
        user.role = role;
        modified = true;
      }
      if (extra.fullName && user.fullName !== extra.fullName) {
        user.fullName = extra.fullName;
        modified = true;
      }
      if (extra.phone && user.phone !== extra.phone) {
        user.phone = extra.phone;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    }
    return user;
  };

  const user = await upsertUser('demo.user@example.com', 'Demo@12345', 'user', {
    fullName: 'Demo User',
    phone: '+91 9000000000',
  });
  await upsertUser('demo.admin@example.com', 'Demo@12345', 'admin', {
    fullName: 'Demo Admin',
    phone: '+91 9000009999',
  });

  const technicianSeeds = [
    {
      email: 'demo.tech@example.com',
      fullName: 'Demo Technician',
      phone: '+91 9000000001',
      specialties: ['electrical', 'hvac'],
      yearsOfExperience: 4,
      hourlyRate: 450,
      averageRating: 4.6,
      totalJobs: 48,
      bio: 'Certified electrician and HVAC specialist serving Bangalore central.',
      serviceRadius: 12,
      currentStatus: 'available',
      lastLocation: { lat: 12.935, lng: 77.624 },
      responseTimeMinutes: 6,
      recentReview: {
        rating: 5,
        customerName: 'Meena P.',
        comment: 'Quick response and resolved the wiring issue immediately.',
      },
    },
    {
      email: 'rahul.hvac@example.com',
      fullName: 'Rahul Sharma',
      phone: '+91 9000000002',
      specialties: ['hvac', 'appliance_repair'],
      yearsOfExperience: 7,
      hourlyRate: 550,
      averageRating: 4.8,
      totalJobs: 96,
      bio: 'HVAC engineer specialising in AC service and installation.',
      serviceRadius: 18,
      currentStatus: 'available',
      lastLocation: { lat: 12.9385, lng: 77.6205 },
      responseTimeMinutes: 8,
      recentReview: {
        rating: 5,
        customerName: 'Karthik V.',
        comment: 'Professional AC installation with detailed walkthrough.',
      },
    },
    {
      email: 'neha.plumber@example.com',
      fullName: 'Neha Patel',
      phone: '+91 9000000003',
      specialties: ['plumbing', 'handyman'],
      yearsOfExperience: 6,
      hourlyRate: 400,
      averageRating: 4.7,
      totalJobs: 110,
      bio: 'Licensed plumber covering residential plumbing emergencies.',
      serviceRadius: 10,
      currentStatus: 'busy',
      lastLocation: { lat: 12.927, lng: 77.636 },
      responseTimeMinutes: 10,
      recentReview: {
        rating: 4,
        customerName: 'Sneha R.',
        comment: 'Resolved leakage quickly. Returned later for a follow-up check.',
      },
    },
    {
      email: 'arjun.carpenter@example.com',
      fullName: 'Arjun Kumar',
      phone: '+91 9000000004',
      specialties: ['handyman', 'gardening'],
      yearsOfExperience: 5,
      hourlyRate: 380,
      averageRating: 4.5,
      totalJobs: 72,
      bio: 'Handyman expert for carpentry and outdoor maintenance.',
      serviceRadius: 14,
      currentStatus: 'available',
      lastLocation: { lat: 12.943, lng: 77.602 },
      responseTimeMinutes: 12,
      recentReview: {
        rating: 5,
        customerName: 'Divya S.',
        comment: 'Garden setup and furniture repair done beautifully.',
      },
    },
    {
      email: 'fatima.cleaning@example.com',
      fullName: 'Fatima Shaikh',
      phone: '+91 9000000005',
      specialties: ['cleaning', 'appliance_repair'],
      yearsOfExperience: 3,
      hourlyRate: 320,
      averageRating: 4.6,
      totalJobs: 58,
      bio: 'Home deep cleaning specialist with appliance maintenance support.',
      serviceRadius: 8,
      currentStatus: 'available',
      lastLocation: { lat: 12.955, lng: 77.601 },
      responseTimeMinutes: 9,
      recentReview: {
        rating: 5,
        customerName: 'Rahul G.',
        comment: 'Sparkling clean kitchen and serviced chimney in one visit.',
      },
    },
  ];

  for (const tech of technicianSeeds) {
    let technicianUser = await User.findOne({ email: tech.email });
    if (!technicianUser) {
      technicianUser = await upsertUser(tech.email, 'Demo@12345', 'technician', {
        fullName: tech.fullName,
        phone: tech.phone,
      });
    }

    let technicianProfile = await Technician.findOne({ userId: technicianUser._id });
    if (!technicianProfile) {
      technicianProfile = await Technician.create({
        userId: technicianUser._id,
        specialties: tech.specialties,
        yearsOfExperience: tech.yearsOfExperience,
        hourlyRate: tech.hourlyRate,
        averageRating: tech.averageRating,
        totalJobs: tech.totalJobs,
        bio: tech.bio,
        certifications: [],
        serviceRadius: tech.serviceRadius,
        currentStatus: tech.currentStatus,
        lastLocation: tech.lastLocation,
        locationCoordinates: tech.lastLocation,
        lastLocationUpdatedAt: new Date(),
        kycStatus: 'not_submitted',
      });
    } else {
      const updates = {
        specialties: tech.specialties,
        yearsOfExperience: tech.yearsOfExperience,
        hourlyRate: tech.hourlyRate,
        averageRating: tech.averageRating,
        totalJobs: tech.totalJobs,
        bio: tech.bio,
        serviceRadius: tech.serviceRadius,
        currentStatus: tech.currentStatus,
        lastLocation: tech.lastLocation,
        locationCoordinates: tech.lastLocation,
      };
      Object.assign(technicianProfile, updates);
      await technicianProfile.save();
    }
  }

  const existingRequests = await ServiceRequest.countDocuments();
  if (existingRequests === 0) {
    const primaryTech = await Technician.findOne({ specialties: { $in: ['electrical'] } }).populate('userId');
    const otherTech = await Technician.findOne({ specialties: { $in: ['plumbing'] } }).populate('userId');

    if (!primaryTech || !otherTech) return;

    const requests = [
      {
        customerId: user._id,
        technicianId: primaryTech?.user?._id,
        category: 'electrical',
        title: 'Electrician - Switch installation',
        description: 'Need to replace old switches with new modular ones.',
        priority: 'high',
        status: 'pending',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estimatedDuration: 120,
        budgetMin: 800,
        budgetMax: 1600,
        locationAddress: 'Indiranagar 2nd Stage, Bangalore',
        locationCoordinates: { lat: 12.9716, lng: 77.5946 },
      },
      {
        customerId: user._id,
        technicianId: otherTech?.user?._id,
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
        technicianId: primaryTech?.user?._id,
        category: 'hvac',
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
};

const removeDemoSeedData = async () => {
  const demoUsers = await User.find({ email: { $in: DEMO_EMAILS } }, { _id: 1 });
  if (!demoUsers.length) return;

  const demoUserIds = demoUsers.map((user) => user._id);

  await Technician.deleteMany({ userId: { $in: demoUserIds } });
  await ServiceRequest.deleteMany({
    $or: [{ customerId: { $in: demoUserIds } }, { technicianId: { $in: demoUserIds } }],
  });
  await User.deleteMany({ _id: { $in: demoUserIds } });

  console.log(`Removed ${demoUsers.length} demo user(s) and related records`);
};

if (shouldSeedDemoData) {
  await ensureDemoUsers();
  console.log('Demo users ready');
} else {
  await removeDemoSeedData();
  console.log('Skipping demo data seed (ENABLE_DEMO_SEED not set to true)');
}
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
app.use('/api/admin', adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Backend listening on port ${port}`));


