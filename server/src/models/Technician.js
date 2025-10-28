import mongoose from 'mongoose';

const TechnicianSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    specialties: [{ type: String }],
    yearsOfExperience: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    bio: { type: String },
    certifications: [{ type: String }],
    serviceRadius: { type: Number, default: 10 },
    currentStatus: { type: String, enum: ['available', 'busy', 'offline'], default: 'offline' },
    lastLocation: { type: Object }
  },
  { timestamps: true }
);

export default mongoose.model('Technician', TechnicianSchema);


