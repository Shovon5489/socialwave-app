const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/postController');

const { protect } = require('../middleware/auth');
const { uploadPost } = require('../middleware/upload');

// ── Static/special routes first (before /:id) ─────────────────────────────
router.get('/feed', protect, getFeed);
router.get('/trending', getTrendingPosts);
router.get('/saved', protect, getSavedPosts);
router.get('/hashtag/:tag', getPostsByHashtag);
router.get('/user/:userId', getUserPosts);

// ── CRUD ───────────────────────────────────────────────────────────────────
router.post('/', protect, uploadPost, createPost);
router.get('/:id', getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// ── Likes ──────────────────────────────────────────────────────────────────
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);

// ── Comments ───────────────────────────────────────────────────────────────
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.post('/:id/comment/:commentId/like', protect, likeComment);
router.post('/:id/comment/:commentId/reply', protect, addReply);

// ── Share & Save ───────────────────────────────────────────────────────────
router.post('/:id/share', protect, sharePost);
router.post('/:id/save', protect, savePost);

module.exports = router;
