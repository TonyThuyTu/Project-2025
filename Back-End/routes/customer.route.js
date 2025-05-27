const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

//lấy danh sách khách hàng
router.get('/', customerController.getAllCustomers);

//lấy dánh sách khách hàng dựa theo id
router.get('/:id', customerController.getCustomerById);

//Chỉnh sửa thông tin khách hàng
router.put('/:id', customerController.updateCustomer);

//chặn khách hàng
router.put('/status/:id', customerController.toggleCustomerStatus);

// Đăng ký
router.post('/register', customerController.register);

// Đăng nhập
router.post('/login', customerController.login);

// OTP - PASS
//Gữi OTP dựa theo email hoặc phone có sẵn trong mail
router.post('/forgot/send-otp', customerController.sendOTP);

//xác nhận otp
router.post('/forgot/verify-otp', customerController.verifyOTP);

//đổi pass
router.post('/forgot/reset-password', customerController.resetPassword);

module.exports = router;