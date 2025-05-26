const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

// Đăng ký
router.post('/register', customerController.register);

// Đăng nhập
router.post('/login', customerController.login);

// OTP - PASS
router.post('/forgot/send-otp', customerController.sendOTP);
router.post('/forgot/verify-otp', customerController.verifyOTP);
router.post('/forgot/reset-password', customerController.resetPassword);

module.exports = router;