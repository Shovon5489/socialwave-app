const fs = require('fs');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

const USER_FIELDS = '_id username firstName lastName fullName avatar isVerified lastActive';

/**
 * @desc    Send a message (text, photo, video, emoji)
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { recipientId, text } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient is required' });
    }

    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      mediaType = isVideo ? 'video' : 'image';
      const subDir = isVideo ? 'videos' : 'images';
      mediaUrl = `/uploads/${subDir}/${req.file.filename}`;

      // Convert image files to persistent base64 data URLs to survive Render restarts
      if (!isVideo) {
        try {
          if (fs.existsSync(req.file.path)) {
            const fileBuffer = fs.readFileSync(req.file.path);
            mediaUrl = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
            try {
              fs.unlinkSync(req.file.path);
            } catch (_) {}
          }
        } catch (mediaErr) {
          console.error('Error converting message image to base64:', mediaErr);
        }
      }
    } else if (req.body.media) {
      mediaUrl = req.body.media;
      mediaType = req.body.mediaType || 'image';
    }

    if (!mediaUrl && (!text || text.trim() === '')) {
      return res.status(400).json({ success: false, message: 'Message must have text or media' });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      text: text ? text.trim() : '',
      media: mediaUrl,
      mediaType,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', USER_FIELDS)
      .populate('recipient', USER_FIELDS);

    // Optional notification
    try {
      const sender = await User.findById(senderId).select('firstName lastName username');
      if (sender) {
        await Notification.create({
          recipient: recipientId,
          sender: senderId,
          type: 'message',
          message: `${sender.firstName || sender.username} sent you a message`,
        });
      }
    } catch (_) {}

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: populated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get conversation messages between current user and another user
 * @route   GET /api/messages/:userId
 * @access  Private
 */
const getConversation = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', USER_FIELDS)
      .populate('recipient', USER_FIELDS);

    // Mark incoming unread messages as read
    await Message.updateMany(
      { sender: otherUserId, recipient: currentUserId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Conversation fetched',
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all conversations (latest message per user)
 * @route   GET /api/messages/conversations
 * @access  Private
 */
const getConversationsList = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', USER_FIELDS)
      .populate('recipient', USER_FIELDS);

    // Group by other user
    const conversationsMap = new Map();

    for (const msg of messages) {
      const otherUser =
        msg.sender._id.toString() === currentUserId.toString()
          ? msg.recipient
          : msg.sender;

      const otherId = otherUser._id.toString();

      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      if (
        msg.recipient._id.toString() === currentUserId.toString() &&
        !msg.isRead
      ) {
        conversationsMap.get(otherId).unreadCount += 1;
      }
    }

    return res.status(200).json({
      success: true,
      data: { conversations: Array.from(conversationsMap.values()) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete' });
    }

    await message.deleteOne();
    return res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversationsList,
  deleteMessage,
};
