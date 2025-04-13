import { Schema, model, models } from 'mongoose';

const PinnedArticleSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  articleId: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  pinnedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying
PinnedArticleSchema.index({ userId: 1, articleId: 1 }, { unique: true });

export default models.PinnedArticle || model('PinnedArticle', PinnedArticleSchema); 