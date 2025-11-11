import mongoose from 'mongoose';
import generateReadableId from '../utils/idGenerator.js';

const TechnicianSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    publicId: { type: String, unique: true, index: true },
    specialties: [{ type: String, index: true }],
    yearsOfExperience: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    bio: { type: String },
    certifications: [{ type: String }],
    serviceRadius: { type: Number, default: 10 },
    currentStatus: { type: String, enum: ['available', 'busy', 'offline'], default: 'offline' },
    lastLocation: { type: Object },
    responseTimeMinutes: { type: Number, default: 10 },
    recentReview: {
      rating: { type: Number },
      customerName: { type: String },
      comment: { type: String },
    },
    kycStatus: {
      type: String,
      enum: ['not_submitted', 'under_review', 'approved', 'rejected'],
      default: 'not_submitted'
    },
    kycGovernmentDocumentPath: { type: String },
    kycGovernmentDocumentOriginalName: { type: String },
    kycSelfieDocumentPath: { type: String },
    kycSelfieDocumentOriginalName: { type: String },
    kycSubmittedAt: { type: Date },
    kycReviewedAt: { type: Date },
    kycFeedback: { type: String }
  },
  { timestamps: true }
);

TechnicianSchema.index({ specialties: 1 });

TechnicianSchema.pre('save', function technicianIdHook(next) {
  if (!this.publicId) {
    this.publicId = generateReadableId('TECH');
  }
  next();
});

export default mongoose.model('Technician', TechnicianSchema);


