import mongoose from 'mongoose';

const ServiceRequestSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'hvac', 'appliance_repair', 'cleaning', 'handyman', 'gardening'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    scheduledDate: Date,
    completionDate: Date,
    estimatedDuration: Number,
    budgetMin: Number,
    budgetMax: Number,
    finalCost: Number,
    reviewRating: Number,
    locationAddress: { type: String, required: true },
    locationCoordinates: {
      lat: Number,
      lng: Number,
    },
    images: [String],
    requirements: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('ServiceRequest', ServiceRequestSchema);


