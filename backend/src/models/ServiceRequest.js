import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: {
      type: String,
      enum: ['user', 'technician', 'admin'],
      required: true,
    },
    contentType: {
      type: String,
      enum: ['text', 'image', 'location', 'booking_update'],
      default: 'text',
    },
    content: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed },
    deliveryStatus: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CommentSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorRole: {
      type: String,
      enum: ['technician', 'admin'],
      default: 'technician',
    },
    body: { type: String, required: true },
    attachments: {
      type: [
        {
          name: { type: String },
          url: { type: String },
        },
      ],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

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
    paymentStatus: {
      type: String,
      enum: ['pending', 'awaiting_payment', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: { type: String }, // 'upi', 'cash', 'card', 'bank_transfer'
    paymentNotes: { type: String },
    paymentConfirmedAt: { type: Date },
    reviewRating: Number,
    reviewComment: { type: String },
    cancellationReason: { type: String },
    locationAddress: { type: String, required: true },
    locationCoordinates: {
      lat: Number,
      lng: Number,
    },
    images: [String],
    requirements: mongoose.Schema.Types.Mixed,
    messages: { type: [MessageSchema], default: [] },
    technicianComments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('ServiceRequest', ServiceRequestSchema);


