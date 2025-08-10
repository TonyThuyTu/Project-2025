const crypto = require('crypto');
const https = require('https');

const partnerCode = "MOMO";
const accessKey = "F8BBA842ECF85";
const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const redirectUrl = "https://your-site.com/payment-return";
const ipnUrl = "https://your-site.com/payment-notify";

function createMoMoPaymentUrl({ amount, orderId, orderInfo = "Thanh toán MoMo", extraData = "" }) {
  return new Promise((resolve, reject) => {
    const requestId = partnerCode + Date.now();
    const requestType = "captureWallet";

    // Giữ nguyên orderInfo khi ký và khi gửi
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo, // dùng đúng như khi ký
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'vi'
    });

    const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.resultCode === 0 && result.payUrl) {
            resolve(result.payUrl);
          } else {
            reject(new Error(`MoMo trả về lỗi: ${result.message} (code: ${result.resultCode})`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(requestBody);
    req.end();
  });
}

module.exports = { createMoMoPaymentUrl };
