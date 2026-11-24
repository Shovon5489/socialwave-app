const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allowed MIME types
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES];

// Disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'misc';
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
      subDir = 'images';
    } else if (VIDEO_MIME_TYPES.includes(file.mimetype)) {
      subDir = 'videos';
    }
    const dest = path.join(uploadsDir, subDir);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter — reject unsupported types
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed: jpeg, jpg, png, gif, webp, mp4, mov, avi, mkv`
      ),
      false
    );
  }
};

// Dynamic file size limit based on mimetype
const limits = (maxImageBytes = 10 * 1024 * 1024, maxVideoBytes = 50 * 1024 * 1024) => ({
  fileSize: maxVideoBytes, // multer checks this before fileFilter knows type, so use the larger value
});

// --- Multer instances ---

/** Upload a single avatar image (field name: 'avatar') */
const uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Avatar must be an image (jpeg, jpg, png, gif, webp)'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('avatar');

/** Upload a single cover photo (field name: 'cover') */
const uploadCover = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Cover photo must be an image (jpeg, jpg, png, gif, webp)'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('cover');

/** Upload up to 10 media files for a post (field name: 'media') */
const uploadPost = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB (covers both image and video)
}).array('media', 10);

/**
 * Wrapper middleware that converts multer errors to consistent JSON responses.
 * @param {Function} multerMiddleware - One of the multer instances above.
 */
const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ success: false, message: 'Too many files (max 10)' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(400).json({ success: false, message: err.message });
  });
};

module.exports = {
  uploadAvatar: handleUpload(uploadAvatar),
  uploadCover: handleUpload(uploadCover),
  uploadPost: handleUpload(uploadPost),
};
