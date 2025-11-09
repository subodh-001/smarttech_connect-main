import mongoose from 'mongoose';

const serviceUpdateSchema = new mongoose.Schema({
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  updatedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statusFrom: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
  },
  statusTo: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    required: true
  },
  message: String,
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Only track creation time
});

// Virtual to populate service request details when needed
serviceUpdateSchema.virtual('serviceRequest', {
  ref: 'ServiceRequest',
  localField: 'serviceRequestId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate user details when needed
serviceUpdateSchema.virtual('updatedBy', {
  ref: 'User',
  localField: 'updatedById',
  foreignField: '_id',
  justOne: true
});

const ServiceUpdate = mongoose.model('ServiceUpdate', serviceUpdateSchema);

export default ServiceUpdate;