const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');

//create voucher
router.post('/', voucherController.createVoucher);

//list all voucher
router.get('/', voucherController.getAllVouchers);

module.exports = router;