const express = require('express');
const router = express.Router();
const {
  createStory,
  getStories,
  viewStory,
  deleteStory,
} = require('../controllers/storyController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadStory } = require('../middleware/upload');

// Routes
router.get('/', optionalAuth, getStories);
router.post('/', protect, uploadStory, createStory);
router.put('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
