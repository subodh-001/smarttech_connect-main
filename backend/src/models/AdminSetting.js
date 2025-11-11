import mongoose from 'mongoose';

const AdminSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true },
    description: { type: String },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    type: {
      type: String,
      enum: ['boolean', 'number', 'string', 'json'],
      default: 'boolean',
    },
    category: { type: String, default: 'general' },
  },
  { timestamps: true }
);

export default mongoose.model('AdminSetting', AdminSettingSchema);

