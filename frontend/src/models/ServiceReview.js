import mongoose from 'mongoose';

const serviceReviewSchema = new mongoose.Schema({
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: String,
  responseText: String, // Technician response
  isPublic: {
    type: Boolean,
    default: true
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

// Virtual to populate service request details when needed
serviceReviewSchema.virtual('serviceRequest', {
  ref: 'ServiceRequest',
  localField: 'serviceRequestId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate customer details when needed
serviceReviewSchema.virtual('customer', {
  ref: 'User',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate technician details when needed
serviceReviewSchema.virtual('technician', {
  ref: 'User',
  localField: 'technicianId',
  foreignField: '_id',
  justOne: true
});

// Static method to update technician rating
serviceReviewSchema.statics.updateTechnicianRating = async function(technicianId) {
  const Technician = mongoose.model('Technician');
  
  // Calculate average rating
  const result = await this.aggregate([
    { $match: { technicianId: new mongoose.Types.ObjectId(technicianId) } },
    { $group: { _id: null, averageRating: { $avg: '$rating' } } }
  ]);
  
  const averageRating = result.length > 0 ? result[0].averageRating : 0;
  
  // Count completed jobs
  const ServiceRequest = mongoose.model('ServiceRequest');
  const completedJobs = await ServiceRequest.countDocuments({
    technicianId: technicianId,
    status: 'completed'
  });
  
  // Update technician profile
  await Technician.findOneAndUpdate(
    { userId: technicianId },
    { 
      rating: parseFloat(averageRating.toFixed(2)),
      totalJobs: completedJobs
    }
  );
};

// Post-save hook to update technician rating
serviceReviewSchema.post('save', async function() {
  await this.constructor.updateTechnicianRating(this.technicianId);
});

// Post-update hook to update technician rating
serviceReviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    await mongoose.model('ServiceReview').updateTechnicianRating(doc.technicianId);
  }
});

const ServiceReview = mongoose.model('ServiceReview', serviceReviewSchema);

export default ServiceReview;