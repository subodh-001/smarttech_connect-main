import mongoose from 'mongoose';
import generateReadableId from '../utils/idGenerator.js';

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
    addresses: [{
      id: { type: String, required: true },
      label: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    }],
    googleId: { type: String, index: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    publicId: { type: String, unique: true, index: true },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre('save', function userIdHook(next) {
  if (!this.publicId) {
    this.publicId = generateReadableId('USR');
  }
  next();
});

export default mongoose.model('User', UserSchema);


