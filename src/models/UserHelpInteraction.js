import mongoose from 'mongoose';

const userHelpInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HelpArticle',
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: ['view', 'helpful', 'not_helpful']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Only track creation time
});

// Compound index to ensure uniqueness of user-article-action combination
userHelpInteractionSchema.index({ userId: 1, articleId: 1, actionType: 1 }, { unique: true });

// Virtual to populate user details when needed
userHelpInteractionSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate article details when needed
userHelpInteractionSchema.virtual('article', {
  ref: 'HelpArticle',
  localField: 'articleId',
  foreignField: '_id',
  justOne: true
});

const UserHelpInteraction = mongoose.model('UserHelpInteraction', userHelpInteractionSchema);

export default UserHelpInteraction;