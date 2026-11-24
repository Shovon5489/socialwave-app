const express = require('express');
const router = express.Router();

const { search, searchUsers, searchPosts, getTrending } = require('../controllers/searchController');

router.get('/', search);
router.get('/users', searchUsers);
router.get('/posts', searchPosts);
router.get('/trending', getTrending);

module.exports = router;
