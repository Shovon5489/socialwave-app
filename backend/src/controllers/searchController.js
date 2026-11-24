const User = require('../models/User');
const Post = require('../models/Post');

const AUTHOR_FIELDS = '_id username firstName lastName fullName avatar isVerified';

/**
 * @route   GET /api/search?q=...
 * @access  Public
 */
const search = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const limit = Math.min(20, parseInt(req.query.limit) || 10);

    if (!query.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const [users, posts] = await Promise.all([
      User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
        ],
        isActive: true,
      })
        .select(AUTHOR_FIELDS + ' bio')
        .limit(limit),

      Post.find({
        $or: [
          { content: { $regex: query, $options: 'i' } },
          { hashtags: { $regex: query, $options: 'i' } },
        ],
        privacy: 'public',
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author', AUTHOR_FIELDS),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Search results',
      data: { query, users, posts, userCount: users.length, postCount: posts.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/search/users?q=...
 * @access  Public
 */
const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    if (!query.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const filter = {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
      ],
      isActive: true,
    };

    const [users, total] = await Promise.all([
      User.find(filter).select(AUTHOR_FIELDS + ' bio location').skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'User search results',
      data: { users, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/search/posts?q=...
 * @access  Public
 */
const searchPosts = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    if (!query.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const filter = {
      $or: [
        { content: { $regex: query, $options: 'i' } },
        { hashtags: { $regex: query, $options: 'i' } },
      ],
      privacy: 'public',
    };

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
      message: 'Post search results',
      data: { posts, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/search/trending
 * @access  Public
 */
const getTrending = async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    // Aggregate top hashtags
    const trendingHashtags = await Post.aggregate([
      { $match: { createdAt: { $gte: since }, privacy: 'public', hashtags: { $exists: true, $not: { $size: 0 } } } },
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 }, postCount: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, hashtag: '$_id', count: 1, postCount: 1 } },
    ]);

    // Trending users (most followers gained recently — approximate by follower count)
    const trendingUsers = await User.find({ isActive: true })
      .select(AUTHOR_FIELDS + ' bio')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      message: 'Trending fetched',
      data: { hashtags: trendingHashtags, users: trendingUsers },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { search, searchUsers, searchPosts, getTrending };
