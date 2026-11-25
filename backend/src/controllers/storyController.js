const fs = require('fs');
const Story = require('../models/Story');

/**
 * @desc    Create a new story
 * @route   POST /api/stories
 * @access  Private
 */
const createStory = async (req, res) => {
  try {
    const { text, backgroundColor } = req.body;
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
          console.error('Error converting story image to base64:', mediaErr);
        }
      }
    } else if (req.body.media) {
      mediaUrl = req.body.media;
      mediaType = req.body.mediaType || 'image';
    }

    if (!mediaUrl && (!text || text.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Story must have an image, video, or text',
      });
    }

    const story = await Story.create({
      author: req.user._id,
      media: mediaUrl,
      mediaType,
      text: text ? text.trim() : '',
      backgroundColor: backgroundColor || '#1877F2',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await story.populate('author', 'firstName lastName username avatar');

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      data: { story },
    });
  } catch (error) {
    console.error('createStory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating story',
    });
  }
};

/**
 * @desc    Get active (unexpired) stories
 * @route   GET /api/stories
 * @access  Public
 */
const getStories = async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
    })
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      data: { stories },
    });
  } catch (error) {
    console.error('getStories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching stories',
    });
  }
};

/**
 * @desc    Mark story as viewed
 * @route   PUT /api/stories/:id/view
 * @access  Private
 */
const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (req.user && !story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    res.json({ success: true, message: 'Story viewed' });
  } catch (error) {
    console.error('viewStory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete a story
 * @route   DELETE /api/stories/:id
 * @access  Private
 */
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this story',
      });
    }

    await story.deleteOne();
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('deleteStory error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting story' });
  }
};

module.exports = {
  createStory,
  getStories,
  viewStory,
  deleteStory,
};
