import mongoose from 'mongoose';

const OtpTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  },
  { timestamps: true }
);

OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OtpToken', OtpTokenSchema);


