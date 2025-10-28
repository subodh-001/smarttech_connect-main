import mongoose from 'mongoose';

const technicianSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specializations: [{
    type: String,
    enum: ['plumbing', 'electrical', 'hvac', 'appliance_repair', 'cleaning', 'handyman', 'gardening']
  }],
  experienceYears: {
    type: Number,
    default: 0
  },
  hourlyRate: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  bio: String,
  certifications: [String],
  serviceRadius: {
    type: Number,
    default: 10
  },
  currentStatus: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
  },
  lastLocation: {
    lat: Number,
    lng: Number
  },
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

// Virtual to populate user details when needed
technicianSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

const Technician = mongoose.model('Technician', technicianSchema);

export default Technician;