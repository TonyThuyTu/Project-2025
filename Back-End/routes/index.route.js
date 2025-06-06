const express = require('express');
const router = express.Router();

// Import route con
const categoryRoute = require('./categories.route');
const productRoute = require('./products.route');
const contactRoute = require('./contact.route');
const customerRoute = require('./customer.route');
const bannerRoute = require('./banner.route');
const EmployeeRoute = require('./employee.route');
const UserAddress = require('./userAddress.route');

// Dùng route con
router.use('/categories', categoryRoute); // => /api/categories

router.use('/products', productRoute); //=> api/products

router.use('/contact', contactRoute); //=> api/contact

router.use('/customers', customerRoute); //=> api/customers

router.use('/banner', bannerRoute); //=> api/banner

router.use('/employees', EmployeeRoute); //=> api/employees

router.use('/address', UserAddress); //=> api/address

module.exports = router;
