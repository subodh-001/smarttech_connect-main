import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'hvac', 'appliance_repair', 'cleaning', 'handyman', 'gardening'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: Date,
  completionDate: Date,
  estimatedDuration: Number, // in minutes
  budgetMin: Number,
  budgetMax: Number,
  finalCost: Number,
  locationAddress: {
    type: String,
    required: true
  },
  locationCoordinates: {
    lat: Number,
    lng: Number
  },
  images: [String], // Array of image URLs
  requirements: mongoose.Schema.Types.Mixed, // Flexible field for custom requirements
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual to populate customer details when needed
serviceRequestSchema.virtual('customer', {
  ref: 'User',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate technician details when needed
serviceRequestSchema.virtual('technician', {
  ref: 'User',
  localField: 'technicianId',
  foreignField: '_id',
  justOne: true
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

export default ServiceRequest;