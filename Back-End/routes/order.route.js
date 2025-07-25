const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

//create order
router.post('/checkout', orderController.checkout);

module.exports = router;