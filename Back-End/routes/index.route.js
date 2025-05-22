const express = require('express');
const router = express.Router();

// Import route con
const categoryRoute = require('./categories.route');

// Dùng route con
router.use('/categories', categoryRoute); // => /api/categories

module.exports = router;
