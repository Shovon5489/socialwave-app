const express = require('express');
const router = express.Router();

const {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  unfriend,
  getFriends,
  getFriendRequests,
  followUser,
  unfollowUser,
  getSuggestedUsers,
  searchUsers,
  blockUser,
  getNotifications,
  markNotificationRead,
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const { uploadAvatar: uploadAvatarMiddleware, uploadCover: uploadCoverMiddleware } = require('../middleware/upload');

// ── Notifications (must be before /:username to avoid route collision) ──────
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, (req, res, next) => {
  const { markAllAsRead } = require('../controllers/notificationController');
  markAllAsRead(req, res, next);
});
router.put('/notifications/:id/read', protect, markNotificationRead);

// ── Friend actions ───────────────────────────────────────────────────────────
router.get('/friends', protect, getFriends);
router.get('/friend-requests', protect, getFriendRequests);
router.post('/friend-request/:userId', protect, sendFriendRequest);
router.put('/friend-request/:userId/accept', protect, acceptFriendRequest);
router.delete('/friend-request/:userId', protect, declineFriendRequest);
router.delete('/unfriend/:userId', protect, unfriend);

// ── Follow actions ───────────────────────────────────────────────────────────
router.post('/follow/:userId', protect, followUser);
router.delete('/unfollow/:userId', protect, unfollowUser);

// ── Block ────────────────────────────────────────────────────────────────────
router.post('/block/:userId', protect, blockUser);

// ── Suggestions & Search ─────────────────────────────────────────────────────
router.get('/suggestions', protect, getSuggestedUsers);
router.get('/', searchUsers);

// ── Profile ──────────────────────────────────────────────────────────────────
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, uploadAvatarMiddleware, uploadAvatar);
router.post('/cover', protect, uploadCoverMiddleware, uploadCover);

// ── User profile by username (last — catches /:username) ─────────────────────
router.get('/:username', getUserProfile);

module.exports = router;
