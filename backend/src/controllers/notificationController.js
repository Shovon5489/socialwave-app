const Notification = require('../models/Notification');

// Fields to populate for sender
const SENDER_FIELDS = '_id username firstName lastName fullName avatar isVerified';

/**
 * @route   GET /api/notifications
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
        .populate('sender', SENDER_FIELDS)
        .populate('post', '_id content'),
      Notification.countDocuments({ recipient: req.user.id }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Notifications fetched',
      data: {
        notifications,
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
 * @route   GET /api/notifications/unread-count
 * @access  Protected
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    return res.status(200).json({ success: true, message: 'Unread count fetched', data: { count } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @access  Protected
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    ).populate('sender', SENDER_FIELDS);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, message: 'Notification marked as read', data: { notification } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/notifications/read-all
 * @access  Protected
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/notifications/:id
 * @access  Protected
 */
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, message: 'Notification deleted', data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };
