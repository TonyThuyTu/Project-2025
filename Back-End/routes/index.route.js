const express = require('express');
const router = express.Router();

// Import route con
const categoryRoute = require('./categories.route');
const productRoute = require('./products.route');
const contactRoute = require('./contact.route');

// Dùng route con
router.use('/categories', categoryRoute); // => /api/categories

router.use('/products', productRoute); //=> api/products

router.use('/contact', contactRoute); //=> api/contact

module.exports = router;
