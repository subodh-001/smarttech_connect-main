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
// Increase JSON body size limit to 5MB to handle base64 image uploads
app.use(express.json({ limit: '5mb' }));
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

// Demo seed data functionality removed - all data must come from real user registrations
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


