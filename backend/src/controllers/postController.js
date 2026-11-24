const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { extractHashtags } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

// Fields to populate for post author
const AUTHOR_FIELDS = '_id username firstName lastName fullName avatar isVerified';

// ─── Helper ───────────────────────────────────────────────────────────────────

const createNotification = async ({ recipient, sender, type, post = null, message = '' }) => {
  if (recipient.toString() === sender.toString()) return;
  await Notification.create({ recipient, sender, type, post, message });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/posts
 * @access  Protected
 */
const createPost = async (req, res, next) => {
  try {
    const { content, privacy, location, tags, type } = req.body;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ success: false, message: 'Post must have content or media' });
    }

    // Build media array from uploaded files
    const media = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video/');
        const subDir = isVideo ? 'videos' : 'images';
        let mediaUrl = `/uploads/${subDir}/${file.filename}`;

        // Convert image files to persistent base64 data URLs to survive Render restarts
        try {
          if (fs.existsSync(file.path)) {
            const fileBuffer = fs.readFileSync(file.path);
            mediaUrl = `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`;
            try {
              fs.unlinkSync(file.path);
            } catch (_) {}
          }
        } catch (mediaErr) {
          console.error('Error converting media to base64:', mediaErr);
        }

        media.push({
          url: mediaUrl,
          type: isVideo ? 'video' : 'image',
          thumbnail: null,
        });
      }
    }

    // Determine post type
    let postType = type || 'text';
    if (media.length > 0) {
      const hasVideo = media.some((m) => m.type === 'video');
      postType = hasVideo ? 'video' : 'image';
    }

    // Extract hashtags from content
    const hashtags = content ? extractHashtags(content) : [];

    // Parse tags (array of user IDs)
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (_) {
        parsedTags = [];
      }
    }

    const post = await Post.create({
      author: req.user.id,
      content: content || '',
      media,
      type: postType,
      privacy: privacy || 'public',
      location: location || '',
      hashtags,
      tags: parsedTags,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', AUTHOR_FIELDS)
      .populate('tags', '_id username firstName lastName avatar');

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: populatedPost },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/feed
 * @access  Protected
 */
const getFeed = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user.id).select('friends following');

    // Show posts from friends + following + own posts
    const feedUserIds = [
      req.user.id,
      ...currentUser.friends.map((id) => id.toString()),
      ...currentUser.following.map((id) => id.toString()),
    ];

    const filter = {
      author: { $in: feedUserIds },
      $or: [
        { privacy: 'public' },
        { privacy: 'friends', author: { $in: feedUserIds } },
        { author: req.user.id },
      ],
    };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', AUTHOR_FIELDS)
        .populate('comments.author', AUTHOR_FIELDS)
        .populate('comments.replies.author', AUTHOR_FIELDS)
        .populate('sharedPost')
        .populate('tags', '_id username firstName lastName avatar'),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Feed fetched',
      data: {
        posts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/user/:userId
 * @access  Public
 */
const getUserPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const targetUserId = req.params.userId;

    // Determine privacy filter
    const isOwn = req.user && req.user.id === targetUserId;
    const privacyFilter = isOwn
      ? {}
      : { privacy: 'public' };

    const filter = { author: targetUserId, ...privacyFilter };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', AUTHOR_FIELDS)
        .populate('comments.author', AUTHOR_FIELDS)
        .populate('sharedPost'),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'User posts fetched',
      data: { posts, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/:id
 * @access  Public
 */
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', AUTHOR_FIELDS)
      .populate('comments.author', AUTHOR_FIELDS)
      .populate('comments.replies.author', AUTHOR_FIELDS)
      .populate('sharedPost')
      .populate('tags', '_id username firstName lastName avatar');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    return res.status(200).json({ success: true, message: 'Post fetched', data: { post } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/posts/:id
 * @access  Protected
 */
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    const { content, privacy, location } = req.body;

    if (content !== undefined) {
      post.content = content;
      post.hashtags = extractHashtags(content);
    }
    if (privacy !== undefined) post.privacy = privacy;
    if (location !== undefined) post.location = location;
    post.isEdited = true;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', AUTHOR_FIELDS)
      .populate('comments.author', AUTHOR_FIELDS);

    return res.status(200).json({ success: true, message: 'Post updated', data: { post: updatedPost } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/posts/:id
 * @access  Protected
 */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    // Remove from savedPosts for all users
    await User.updateMany({ savedPosts: post._id }, { $pull: { savedPosts: post._id } });

    return res.status(200).json({ success: true, message: 'Post deleted', data: null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/posts/:id/like
 * @access  Protected
 */
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Post already liked' });
    }

    post.likes.push(req.user.id);
    await post.save();

    // Notify post author
    if (post.author.toString() !== req.user.id) {
      const liker = await User.findById(req.user.id).select('firstName username');
      await createNotification({
        recipient: post.author,
        sender: req.user.id,
        type: 'like',
        post: post._id,
        message: `${liker.firstName || liker.username} liked your post`,
      });
    }

    return res.status(200).json({ success: true, message: 'Post liked', data: { likeCount: post.likes.length } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/posts/:id/like
 * @access  Protected
 */
const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    await post.save();

    return res.status(200).json({ success: true, message: 'Post unliked', data: { likeCount: post.likes.length } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/posts/:id/comment
 * @access  Protected
 */
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = { author: req.user.id, content: content.trim(), likes: [], replies: [] };
    post.comments.push(comment);
    await post.save();

    // Get the newly created comment
    const newComment = post.comments[post.comments.length - 1];

    // Populate author for the comment in the response
    await post.populate('comments.author', AUTHOR_FIELDS);
    const populatedComment = post.comments.id(newComment._id);

    // Notify post author
    if (post.author.toString() !== req.user.id) {
      const commenter = await User.findById(req.user.id).select('firstName username');
      await createNotification({
        recipient: post.author,
        sender: req.user.id,
        type: 'comment',
        post: post._id,
        message: `${commenter.firstName || commenter.username} commented on your post`,
      });
    }

    return res.status(201).json({ success: true, message: 'Comment added', data: { comment: populatedComment } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/posts/:id/comment/:commentId
 * @access  Protected
 */
const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id && post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();

    return res.status(200).json({ success: true, message: 'Comment deleted', data: null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/posts/:id/comment/:commentId/like
 * @access  Protected
 */
const likeComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const alreadyLiked = comment.likes.includes(req.user.id);
    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      comment.likes.push(req.user.id);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Comment unliked' : 'Comment liked',
      data: { likeCount: comment.likes.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/posts/:id/comment/:commentId/reply
 * @access  Protected
 */
const addReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const reply = { author: req.user.id, content: content.trim(), likes: [] };
    comment.replies.push(reply);
    await post.save();

    // Notify comment author
    if (comment.author.toString() !== req.user.id) {
      const replier = await User.findById(req.user.id).select('firstName username');
      await createNotification({
        recipient: comment.author,
        sender: req.user.id,
        type: 'reply',
        post: post._id,
        message: `${replier.firstName || replier.username} replied to your comment`,
      });
    }

    const updatedComment = comment.replies[comment.replies.length - 1];

    return res.status(201).json({ success: true, message: 'Reply added', data: { reply: updatedComment } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/posts/:id/share
 * @access  Protected
 */
const sharePost = async (req, res, next) => {
  try {
    const originalPost = await Post.findById(req.params.id);
    if (!originalPost) return res.status(404).json({ success: false, message: 'Post not found' });

    const { content, privacy } = req.body;

    // Create a new shared post
    const sharedPost = await Post.create({
      author: req.user.id,
      content: content || '',
      type: 'shared',
      privacy: privacy || 'public',
      sharedPost: originalPost._id,
      hashtags: content ? extractHashtags(content) : [],
    });

    // Record the share on the original post
    if (!originalPost.shares.includes(req.user.id)) {
      originalPost.shares.push(req.user.id);
      await originalPost.save();
    }

    // Notify original post author
    if (originalPost.author.toString() !== req.user.id) {
      const sharer = await User.findById(req.user.id).select('firstName username');
      await createNotification({
        recipient: originalPost.author,
        sender: req.user.id,
        type: 'share',
        post: originalPost._id,
        message: `${sharer.firstName || sharer.username} shared your post`,
      });
    }

    const populatedSharedPost = await Post.findById(sharedPost._id)
      .populate('author', AUTHOR_FIELDS)
      .populate('sharedPost');

    return res.status(201).json({ success: true, message: 'Post shared', data: { post: populatedSharedPost } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/posts/:id/save
 * @access  Protected
 */
const savePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const user = await User.findById(req.user.id).select('savedPosts');
    const isSaved = user.savedPosts.includes(postId);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
      await user.save();
      return res.status(200).json({ success: true, message: 'Post unsaved', data: { saved: false } });
    }

    user.savedPosts.push(postId);
    await user.save();
    return res.status(200).json({ success: true, message: 'Post saved', data: { saved: true } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/saved
 * @access  Protected
 */
const getSavedPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id).select('savedPosts');
    const totalSaved = user.savedPosts.length;

    const savedPostIds = user.savedPosts.slice(skip, skip + limit);

    const posts = await Post.find({ _id: { $in: savedPostIds } })
      .populate('author', AUTHOR_FIELDS)
      .populate('sharedPost')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Saved posts fetched',
      data: { posts, total: totalSaved, page, limit },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/trending
 * @access  Public
 */
const getTrendingPosts = async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit) || 10);

    // Posts from the last 7 days with most engagement
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await Post.aggregate([
      { $match: { createdAt: { $gte: since }, privacy: 'public' } },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $size: '$likes' },
              { $multiply: [{ $size: '$comments' }, 2] },
              { $multiply: [{ $size: '$shares' }, 3] },
              '$views',
            ],
          },
        },
      },
      { $sort: { engagementScore: -1 } },
      { $limit: limit },
    ]);

    // Populate authors
    await Post.populate(posts, { path: 'author', select: AUTHOR_FIELDS });

    return res.status(200).json({
      success: true,
      message: 'Trending posts fetched',
      data: { posts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/posts/hashtag/:tag
 * @access  Public
 */
const getPostsByHashtag = async (req, res, next) => {
  try {
    const tag = req.params.tag.toLowerCase().replace(/^#/, '');
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { hashtags: tag, privacy: 'public' };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', AUTHOR_FIELDS),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: `Posts with hashtag #${tag}`,
      data: { posts, total, page, limit, hashtag: tag },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeed,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  likeComment,
  addReply,
  sharePost,
  savePost,
  getSavedPosts,
  getTrendingPosts,
  getPostsByHashtag,
};
