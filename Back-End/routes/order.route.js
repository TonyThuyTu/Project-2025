const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

//create order
router.post('/checkout', orderController.checkout);

//IPN Momo
router.post('/payment-momo', orderController.momoIPN);

//get list order by id
router.get("/customer/:id", orderController.getOrdersByCustomerId);

//get detail order
router.get('/:id', orderController.getOrderDetail);

//get list
router.get('/', orderController.getAllOrders);

module.exports = router;