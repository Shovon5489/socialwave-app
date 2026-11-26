const User = require('../models/User');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');

// Fields to populate when returning user objects
const USER_BASIC_FIELDS = '_id username firstName lastName fullName avatar coverPhoto isVerified role';

// ─── Helper ───────────────────────────────────────────────────────────────────

const createNotification = async ({ recipient, sender, type, post = null, message = '' }) => {
  if (recipient.toString() === sender.toString()) return; // no self-notifications
  await Notification.create({ recipient, sender, type, post, message });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/users/:username
 * @access  Public
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select('-password -resetPasswordToken -resetPasswordExpire -blockedUsers')
      .populate('friends', USER_BASIC_FIELDS)
      .populate('followers', USER_BASIC_FIELDS)
      .populate('following', USER_BASIC_FIELDS);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'Profile fetched', data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @access  Protected
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'bio', 'location', 'website', 'dateOfBirth', 'isPrivate'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'Profile updated', data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/avatar
 * @access  Protected
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Convert to persistent base64 data URL so it never disappears across Render restarts
    let avatarUrl = `/uploads/images/${req.file.filename}`;
    try {
      if (fs.existsSync(req.file.path)) {
        const fileBuffer = fs.readFileSync(req.file.path);
        avatarUrl = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
        fs.unlinkSync(req.file.path);
      }
    } catch (_) {}

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: avatarUrl, user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/cover
 * @access  Protected
 */
const uploadCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Convert to persistent base64 data URL so it never disappears across Render restarts
    let coverUrl = `/uploads/images/${req.file.filename}`;
    try {
      if (fs.existsSync(req.file.path)) {
        const fileBuffer = fs.readFileSync(req.file.path);
        coverUrl = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
        fs.unlinkSync(req.file.path);
      }
    } catch (_) {}

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { coverPhoto: coverUrl },
      { new: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Cover photo uploaded successfully',
      data: { coverPhoto: coverUrl, user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/friend-request/:userId
 * @access  Protected
 */
const sendFriendRequest = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    const senderId = req.user.id;

    if (targetId === senderId) {
      return res.status(400).json({ success: false, message: 'You cannot send a friend request to yourself' });
    }

    const [sender, target] = await Promise.all([
      User.findById(senderId),
      User.findById(targetId),
    ]);

    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Already friends
    if (sender.friends.some((id) => id.toString() === targetId)) {
      return res.status(400).json({ success: false, message: 'You are already friends' });
    }

    // Already sent — also repair target.friendRequests if it was missing
    if (sender.sentFriendRequests.some((id) => id.toString() === targetId)) {
      const targetHasReq = target.friendRequests.some((r) => r.from.toString() === senderId);
      if (!targetHasReq) {
        target.friendRequests.push({ from: senderId });
        await target.save();
        await createNotification({
          recipient: targetId,
          sender: senderId,
          type: 'friend_request',
          message: `${sender.firstName || sender.username} sent you a friend request`,
        });
      }
      return res.status(400).json({ success: false, message: 'Friend request already sent' });
    }

    // Target already sent a request to sender
    if (sender.friendRequests.some((r) => r.from.toString() === targetId)) {
      return res.status(400).json({ success: false, message: 'This user already sent you a friend request' });
    }

    // Blocked
    if (target.blockedUsers.some((id) => id.toString() === senderId)) {
      return res.status(403).json({ success: false, message: 'Unable to send friend request' });
    }

    sender.sentFriendRequests.push(targetId);
    if (!target.friendRequests.some((r) => r.from.toString() === senderId)) {
      target.friendRequests.push({ from: senderId });
    }

    await Promise.all([sender.save(), target.save()]);

    await createNotification({
      recipient: targetId,
      sender: senderId,
      type: 'friend_request',
      message: `${sender.firstName || sender.username} sent you a friend request`,
    });

    return res.status(200).json({ success: true, message: 'Friend request sent', data: null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/friend-request/:userId/accept
 * @access  Protected
 */
const acceptFriendRequest = async (req, res, next) => {
  try {
    const requesterId = req.params.userId;
    const currentUserId = req.user.id;

    const [currentUser, requester] = await Promise.all([
      User.findById(currentUserId),
      User.findById(requesterId),
    ]);

    if (!requester) return res.status(404).json({ success: false, message: 'User not found' });

    const requestIndex = currentUser.friendRequests.findIndex(
      (r) => r.from.toString() === requesterId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ success: false, message: 'No friend request from this user' });
    }

    // Remove from friendRequests and sentFriendRequests
    currentUser.friendRequests.splice(requestIndex, 1);
    requester.sentFriendRequests = requester.sentFriendRequests.filter(
      (id) => id.toString() !== currentUserId
    );

    // Add to friends
    currentUser.friends.push(requesterId);
    requester.friends.push(currentUserId);

    await Promise.all([currentUser.save(), requester.save()]);

    await createNotification({
      recipient: requesterId,
      sender: currentUserId,
      type: 'friend_accepted',
      message: `${currentUser.firstName || currentUser.username} accepted your friend request`,
    });

    return res.status(200).json({ success: true, message: 'Friend request accepted', data: null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/friend-request/:userId
 * @access  Protected
 * Decline an incoming request OR cancel an outgoing request.
 */
const declineFriendRequest = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.id;

    const [currentUser, otherUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(otherUserId),
    ]);

    if (!otherUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Remove incoming request from currentUser
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (r) => r.from.toString() !== otherUserId
    );

    // Remove outgoing request from currentUser
    currentUser.sentFriendRequests = currentUser.sentFriendRequests.filter(
      (id) => id.toString() !== otherUserId
    );

    // Remove outgoing request from otherUser
    otherUser.sentFriendRequests = otherUser.sentFriendRequests.filter(
      (id) => id.toString() !== currentUserId
    );

    // Remove incoming request from otherUser
    otherUser.friendRequests = otherUser.friendRequests.filter(
      (r) => r.from.toString() !== currentUserId
    );

    await Promise.all([currentUser.save(), otherUser.save()]);

    return res.status(200).json({ success: true, message: 'Friend request declined', data: null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/friend-request/:userId  (alias — same handler used for cancel)
 * @access  Protected
 */
const cancelFriendRequest = declineFriendRequest;

/**
 * @route   DELETE /api/users/unfriend/:userId
 * @access  Protected
 */
const unfriend = async (req, res, next) => {
  try {
    const friendId = req.params.userId;
    const currentUserId = req.user.id;

    const [currentUser, friend] = await Promise.all([
      User.findById(currentUserId),
      User.findById(friendId),
    ]);

    if (!friend) return res.status(404).json({ success: false, message: 'User not found' });

    currentUser.friends = currentUser.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== currentUserId);

    await Promise.all([currentUser.save(), friend.save()]);

    return res.status(200).json({ success: true, message: 'Unfriended successfully', data: null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/friends
 * @access  Protected
 */
const getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('friends')
      .populate('friends', USER_BASIC_FIELDS + ' bio location lastActive');

    return res.status(200).json({
      success: true,
      message: 'Friends fetched',
      data: { friends: user.friends, total: user.friends.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/friend-requests
 * @access  Protected
 */
const getFriendRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('friendRequests')
      .populate('friendRequests.from', USER_BASIC_FIELDS + ' bio location');

    return res.status(200).json({
      success: true,
      message: 'Friend requests fetched',
      data: { requests: user.friendRequests, total: user.friendRequests.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/follow/:userId
 * @access  Protected
 */
const followUser = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    const currentUserId = req.user.id;

    if (targetId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const [currentUser, target] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetId),
    ]);

    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    if (currentUser.following.includes(targetId)) {
      return res.status(400).json({ success: false, message: 'You are already following this user' });
    }

    currentUser.following.push(targetId);
    target.followers.push(currentUserId);

    await Promise.all([currentUser.save(), target.save()]);

    await createNotification({
      recipient: targetId,
      sender: currentUserId,
      type: 'follow',
      message: `${currentUser.firstName || currentUser.username} started following you`,
    });

    return res.status(200).json({ success: true, message: 'User followed', data: null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/unfollow/:userId
 * @access  Protected
 */
const unfollowUser = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    const currentUserId = req.user.id;

    const [currentUser, target] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetId),
    ]);

    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    currentUser.following = currentUser.following.filter((id) => id.toString() !== targetId);
    target.followers = target.followers.filter((id) => id.toString() !== currentUserId);

    await Promise.all([currentUser.save(), target.save()]);

    return res.status(200).json({ success: true, message: 'User unfollowed', data: null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:username/followers  (called from route manually)
 * @access  Public
 */
const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId || req.user.id)
      .select('followers')
      .populate('followers', USER_BASIC_FIELDS);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({
      success: true,
      message: 'Followers fetched',
      data: { followers: user.followers, total: user.followers.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:username/following
 * @access  Public
 */
const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId || req.user.id)
      .select('following')
      .populate('following', USER_BASIC_FIELDS);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({
      success: true,
      message: 'Following fetched',
      data: { following: user.following, total: user.following.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/suggestions
 * @access  Protected
 */
const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id).select(
      'friends blockedUsers sentFriendRequests friendRequests'
    );

    const exclude = new Set([
      req.user.id.toString(),
      ...((currentUser?.friends || []).map((id) => (id._id || id).toString())),
      ...((currentUser?.blockedUsers || []).map((id) => (id._id || id).toString())),
    ]);

    const sentSet = new Set(
      (currentUser?.sentFriendRequests || []).map((id) => (id._id || id).toString())
    );
    const receivedSet = new Set(
      (currentUser?.friendRequests || []).map((r) => (r.from?._id || r.from)?.toString())
    );

    const users = await User.find({
      _id: { $nin: Array.from(exclude) },
      isActive: { $ne: false },
    })
      .select(USER_BASIC_FIELDS + ' bio location followingCount followerCount')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const suggestions = users.map((u) => ({
      ...u,
      requestSent: sentSet.has(u._id.toString()),
      requestReceived: receivedSet.has(u._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      message: 'Suggestions fetched',
      data: { suggestions },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users?q=...
 * @access  Public
 */
const searchUsers = async (req, res, next) => {
  try {
    const query = (req.query.q || '').trim();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    let filter = { isActive: { $ne: false } };

    if (query) {
      const words = query.split(/\s+/).filter(Boolean);
      const orConditions = [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
      ];

      if (words.length > 1) {
        orConditions.push({
          $and: words.map((w) => ({
            $or: [
              { firstName: { $regex: w, $options: 'i' } },
              { lastName: { $regex: w, $options: 'i' } },
              { username: { $regex: w, $options: 'i' } },
            ],
          })),
        });
      }
      filter.$or = orConditions;
    }

    const [users, total] = await Promise.all([
      User.find(filter).select(USER_BASIC_FIELDS + ' bio location').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Users fetched',
      data: { users, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/block/:userId
 * @access  Protected
 */
const blockUser = async (req, res, next) => {
  try {
    const targetId = req.params.userId;
    const currentUserId = req.user.id;

    if (targetId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    const currentUser = await User.findById(currentUserId);

    if (currentUser.blockedUsers.includes(targetId)) {
      // Unblock
      currentUser.blockedUsers = currentUser.blockedUsers.filter(
        (id) => id.toString() !== targetId
      );
      await currentUser.save();
      return res.status(200).json({ success: true, message: 'User unblocked', data: null });
    }

    // Block — also remove from friends/following
    currentUser.blockedUsers.push(targetId);
    currentUser.friends = currentUser.friends.filter((id) => id.toString() !== targetId);
    currentUser.following = currentUser.following.filter((id) => id.toString() !== targetId);
    currentUser.followers = currentUser.followers.filter((id) => id.toString() !== targetId);
    await currentUser.save();

    // Remove from target's friends/followers
    await User.findByIdAndUpdate(targetId, {
      $pull: { friends: currentUserId, followers: currentUserId, following: currentUserId },
    });

    return res.status(200).json({ success: true, message: 'User blocked', data: null });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/notifications
 * @access  Protected
 */
const getNotifications = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', USER_BASIC_FIELDS)
        .populate('post', '_id content'),
      Notification.countDocuments({ recipient: req.user.id }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Notifications fetched',
      data: { notifications, total, page, limit },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/notifications/:id/read
 * @access  Protected
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, message: 'Notification marked as read', data: { notification } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  unfriend,
  getFriends,
  getFriendRequests,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getSuggestedUsers,
  searchUsers,
  blockUser,
  getNotifications,
  markNotificationRead,
};
