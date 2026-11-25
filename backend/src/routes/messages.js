const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversationsList,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { uploadMessage } = require('../middleware/upload');

router.get('/conversations', protect, getConversationsList);
router.get('/:userId', protect, getConversation);
router.post('/', protect, uploadMessage, sendMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
