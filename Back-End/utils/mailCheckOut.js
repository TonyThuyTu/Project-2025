const nodemailer = require('nodemailer');

const sendOrderConfirmationEmail = async (customerEmail, orderInfo) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Hoặc smtp server khác nếu dùng hosting riêng
    auth: {
      user: process.env.EMAIL_USER, // Ví dụ: 'yourmail@gmail.com'
      pass: process.env.EMAIL_PASS, // App password nếu dùng Gmail
    },
  });

  const { orderId, products, totalAmount, orderDate, customerName, address } = orderInfo;

  // Tạo HTML nội dung mail
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>Đơn hàng của bạn đã được đặt thành công!</h2>
      <p>Xin chào <strong>${customerName}</strong>,</p>
      <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. Đây là thông tin đơn hàng của bạn:</p>

      <h3>📦 Mã đơn hàng: ${orderId}</h3>
      <p><strong>Ngày đặt:</strong> ${new Date(orderDate).toLocaleString('vi-VN')}</p>
      <p><strong>Địa chỉ giao hàng:</strong> ${address}</p>

      <h4>Sản phẩm:</h4>
      <ul>
        ${products.map(item => `
          <li>
            ${item.name} - SL: ${item.quantity}
            ${item.options?.length ? ` - Tuỳ chọn: ${item.options.join(', ')}` : ''}
          </li>
        `).join('')}
      </ul>

      <p><strong>Tổng thanh toán:</strong> ${Number(totalAmount).toLocaleString('vi-VN')} ₫</p>

      <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được vận chuyển.</p>

      <p>Trân trọng,<br/>Đội ngũ cửa hàng</p>
    </div>
  `;

  // Cấu hình email
  const mailOptions = {
    from: `"Cửa hàng" <${process.env.MAIL_USER}>`,
    to: customerEmail,
    subject: `Xác nhận đặt hàng #${orderId}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email xác nhận đã được gửi đến:", customerEmail);
  } catch (error) {
    console.error("❌ Lỗi khi gửi mail xác nhận:", error);
  }
};

module.exports = sendOrderConfirmationEmail;
