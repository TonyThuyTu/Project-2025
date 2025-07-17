// utils/momoPayment.js
const MOMO_URL = 'https://test-payment.momo.vn/v2/gateway/api/create';
const axios = require('axios');
const crypto = require('crypto');

exports.createMomoPayment = async ({ amount, orderId }) => {
  // Dữ liệu test MoMo (đăng ký với tài khoản test của bạn)
  const partnerCode = 'MOMO...';
  const accessKey = '...';
  const secretKey = '...';
  const returnUrl = `http://localhost:5000/api/order/momo/return`;
  const notifyUrl = returnUrl;

  const requestId = `${orderId}-${Date.now()}`;
  const orderInfo = 'Thanh toán đơn hàng #' + orderId;

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&requestId=${requestId}&returnUrl=${returnUrl}&notifyUrl=${notifyUrl}`;
  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const body = {
    partnerCode,
    accessKey,
    requestId,
    orderId: orderId.toString(),
    orderInfo,
    amount: amount.toString(),
    returnUrl,
    notifyUrl,
    requestType: 'captureWallet',
    signature,
    extraData: '',
    lang: 'vi',
  };

  const response = await axios.post(MOMO_URL, body);
  return response.data.payUrl;
};
