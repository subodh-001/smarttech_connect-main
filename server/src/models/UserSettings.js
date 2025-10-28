import mongoose from 'mongoose';

const UserSettingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    notificationsEnabled: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    languagePreference: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    privacyLevel: { type: String, default: 'normal' }
  },
  { timestamps: true }
);

export default mongoose.model('UserSettings', UserSettingsSchema);


