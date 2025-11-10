import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String },
    phone: { type: String },
    avatarUrl: { type: String },
    role: { type: String, enum: ['user', 'technician', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    googleId: { type: String, index: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' }
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);


