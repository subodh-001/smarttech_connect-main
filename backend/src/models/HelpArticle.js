import mongoose from 'mongoose';

const ContentSectionSchema = new mongoose.Schema(
  {
    heading: { type: String },
    body: { type: String },
    bullets: [{ type: String }],
    icon: { type: String },
  },
  { _id: false }
);

const FeedbackEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fingerprint: { type: String },
    isHelpful: { type: Boolean, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const HelpArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'getting-started',
        'booking-services',
        'account-settings',
        'billing',
        'privacy-security',
        'troubleshooting',
      ],
      index: true,
    },
    audience: {
      type: [String],
      enum: ['user', 'technician', 'admin', 'all'],
      default: ['all'],
    },
    tags: [{ type: String }],
    keywords: [{ type: String }],
    contentSections: [ContentSectionSchema],
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    estimatedReadMinutes: { type: Number, min: 1, default: 3 },
    viewCount: { type: Number, default: 0 },
    helpfulCount: { type: Number, default: 0 },
    notHelpfulCount: { type: Number, default: 0 },
    feedbackEntries: [FeedbackEntrySchema],
    lastViewedAt: { type: Date },
    lastReviewedAt: { type: Date },
    lastUpdatedBy: { type: String },
  },
  { timestamps: true }
);

HelpArticleSchema.index({
  title: 'text',
  summary: 'text',
  tags: 'text',
  keywords: 'text',
  'contentSections.heading': 'text',
  'contentSections.body': 'text',
});

export default mongoose.model('HelpArticle', HelpArticleSchema);

