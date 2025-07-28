const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

//create order
router.post('/checkout', orderController.checkout);

//get list
router.get('/', orderController.getAllOrders);

module.exports = router;