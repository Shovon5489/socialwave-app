const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Story must have an author'],
    },
    media: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: null,
    },
    text: {
      type: String,
      maxlength: [500, 'Story text cannot exceed 500 characters'],
      default: '',
    },
    backgroundColor: {
      type: String,
      default: '#000000',
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: viewCount
storySchema.virtual('viewCount').get(function () {
  return this.viewers ? this.viewers.length : 0;
});

// Virtual: isExpired
storySchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date();
});

// TTL index — MongoDB automatically removes expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Story', storySchema);
