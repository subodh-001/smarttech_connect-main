import mongoose from 'mongoose';

const SupportTicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['technical', 'billing', 'account', 'service', 'feature', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    message: { type: String, required: true, trim: true },
    channel: { type: String, enum: ['email', 'phone', 'chat'], default: 'email' },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    metadata: { type: Object },
    lastActivityAt: { type: Date },
  },
  { timestamps: true }
);

SupportTicketSchema.pre('save', function setLastActivity(next) {
  this.lastActivityAt = new Date();
  next();
});

export default mongoose.model('SupportTicket', SupportTicketSchema);

