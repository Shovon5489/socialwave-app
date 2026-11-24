const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a given user id and role.
 * @param {string} id - The user's MongoDB _id as a string.
 * @param {string} [role='user'] - The user's role.
 * @returns {string} Signed JWT token.
 */
const generateToken = (id, role = 'user') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;
