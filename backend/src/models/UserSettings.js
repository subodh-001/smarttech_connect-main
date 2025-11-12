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
    privacyLevel: { type: String, default: 'normal' },
    // Notification categories
    deliveryMethods: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    bookings: {
      newBooking: { type: Boolean, default: true },
      statusUpdates: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      cancellations: { type: Boolean, default: true }
    },
    technician: {
      assignment: { type: Boolean, default: true },
      location: { type: Boolean, default: true },
      arrival: { type: Boolean, default: true },
      completion: { type: Boolean, default: true }
    },
    payments: {
      invoices: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      refunds: { type: Boolean, default: true },
      failures: { type: Boolean, default: true }
    },
    marketing: {
      offers: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
      tips: { type: Boolean, default: true },
      surveys: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

export default mongoose.model('UserSettings', UserSettingsSchema);


