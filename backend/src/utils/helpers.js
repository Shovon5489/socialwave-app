/**
 * Extract all hashtags from a text string.
 * @param {string} content - The text content to scan.
 * @returns {string[]} Array of lowercase hashtag strings (without the # symbol).
 */
const extractHashtags = (content) => {
  if (!content || typeof content !== 'string') return [];
  const regex = /#([a-zA-Z0-9_]+)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    if (!matches.includes(tag)) {
      matches.push(tag);
    }
  }
  return matches;
};

/**
 * Sanitize a filename by replacing non-alphanumeric characters.
 * @param {string} filename - The original filename.
 * @returns {string} Sanitized filename.
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Build a pagination object for responses.
 * @param {number} page - Current page (1-indexed).
 * @param {number} limit - Items per page.
 * @param {number} total - Total number of documents.
 * @returns {{ page, limit, total, totalPages, hasNextPage, hasPrevPage }}
 */
const buildPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Remove sensitive fields from a user object.
 * @param {object} user - Mongoose user document or plain object.
 * @returns {object} User without password.
 */
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

module.exports = {
  extractHashtags,
  sanitizeFilename,
  buildPagination,
  sanitizeUser,
};
