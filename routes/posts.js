var express = require('express');
var router = express.Router();
var postsController = require('../controllers/posts_controller');


// Display post page.
// GET /post/
router.get('/', postsController.index);

// Populate tokens
// POST /blog
router.post('/', postsController.populate);

// Export routes
module.exports = router;
