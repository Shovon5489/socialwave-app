const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      maxlength: [2000, 'Reply cannot exceed 2000 characters'],
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [replySchema],
  },
  { timestamps: true }
);

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    thumbnail: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must have an author'],
    },
    content: {
      type: String,
      maxlength: [5000, 'Post content cannot exceed 5000 characters'],
      trim: true,
      default: '',
    },
    media: [mediaSchema],
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'shared'],
      default: 'text',
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
    shares: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    sharedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    location: {
      type: String,
      maxlength: [200, 'Location cannot exceed 200 characters'],
      default: '',
    },
    views: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: likeCount
postSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual: commentCount
postSchema.virtual('commentCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

// Virtual: shareCount
postSchema.virtual('shareCount').get(function () {
  return this.shares ? this.shares.length : 0;
});

// Text index for search
postSchema.index({ content: 'text', hashtags: 'text' });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
