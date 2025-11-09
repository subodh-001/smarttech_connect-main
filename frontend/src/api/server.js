import express from 'express';
import cors from 'cors';
import { getMongoDBConnection } from '../lib/mongodb.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import technicianRoutes from './technicianRoutes.js';
import serviceRequestRoutes from './serviceRequestRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import chatRoutes from './chatRoutes.js';
import helpArticleRoutes from './helpArticleRoutes.js';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
getMongoDBConnection()
  .then(() => console.log('MongoDB connected via server'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/help-articles', helpArticleRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;