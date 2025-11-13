import mongoose from 'mongoose';

const WithdrawalSchema = new mongoose.Schema(
  {
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    upiId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    processedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate transaction ID before saving
WithdrawalSchema.pre('save', async function (next) {
  if (!this.transactionId && this.isNew) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionId = `WD${timestamp}${random}`;
  }
  next();
});

export default mongoose.model('Withdrawal', WithdrawalSchema);

