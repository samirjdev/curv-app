import { Schema, model, models } from 'mongoose';

const ArticleSchema = new Schema({
  date: {
    type: String,
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true,
    enum: ['sports', 'technology', 'business', 'entertainment', 'science', 'health', 'politics', 'gaming']
  },
  emoji: {
    type: String,
    required: true
  },
  headline: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sources: [{
    type: String,
    required: true
  }],
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  ratings: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create compound index for efficient querying
ArticleSchema.index({ date: 1, topic: 1 });

export default models.Article || model('Article', ArticleSchema); 