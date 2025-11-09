import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messageText: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    default: 'text',
    enum: ['text', 'image', 'location']
  },
  attachmentUrl: String,
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Only track creation time
});

// Virtual to populate service request details when needed
chatMessageSchema.virtual('serviceRequest', {
  ref: 'ServiceRequest',
  localField: 'serviceRequestId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate sender details when needed
chatMessageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;