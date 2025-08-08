const nodemailer = require('nodemailer');

const sendOrderConfirmationEmail = async (customerEmail, orderInfo) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const {
    id_order,
    products,
    total_amount,
    order_date,
    name,
    phone,
    email,
    address,
    payment_method,
    note
  } = orderInfo;

  const formattedOrderDate = new Date(order_date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const productRows = products.map(product => {
    const optionsHtml = product.options && product.options.length > 0
      ? `<div style="font-size: 12px; color: #555; margin-top: 4px;"><strong>Biến thể:</strong> ${product.options.join(', ')}</div>`
      : '';

    return `
      <tr>
        <td style="padding: 12px; border: 1px solid #ddd;">
          ${product.product_name}
          ${optionsHtml}
        </td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${product.quantity}</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">${Number(product.price).toLocaleString('vi-VN')} đ</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #2c3e50;">🎉 Cảm ơn bạn đã đặt hàng tại <span style="color: #e67e22;">Táo Bro</span>!</h2>
      <p style="font-size: 16px;">Xin chào <strong style="color: #2980b9; font-size: 17px;">${name}</strong>!</p>
      <p style="font-size: 15px;">Chúng tôi đã nhận được đơn hàng #<strong>${id_order}</strong> vào lúc <strong>${formattedOrderDate}</strong>. Dưới đây là chi tiết đơn hàng của bạn:</p>

      <div style="margin-top: 20px;">
        <h3 style="border-left: 4px solid #e67e22; padding-left: 10px; color: #2c3e50;">🛒 Chi tiết đơn hàng</h3>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8f8f8;">
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Sản phẩm</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Số lượng</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 20px; font-size: 15px;">
        <p><strong>👤 Khách hàng:</strong> ${name}</p>
        <p><strong>📞 Số điện thoại:</strong> ${phone}</p>
        <p><strong>📧 Email:</strong> ${email}</p>
        <p><strong>🏠 Địa chỉ giao hàng:</strong> ${address}</p>
        <p><strong>💳 Phương thức thanh toán:</strong> ${payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán Online'}</p>
        <p><strong>📝 Ghi chú:</strong> ${note || 'Không có'}</p>
        <p><strong>💰 Tổng tiền:</strong> <span style="color: #e74c3c; font-weight: bold;">${Number(total_amount).toLocaleString('vi-VN')} đ</span></p>
      </div>

      <hr style="margin: 30px 0;" />

      <p style="font-size: 14px; color: #7f8c8d;">Nếu bạn có bất kỳ thắc mắc nào, vui lòng phản hồi email này hoặc liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
      <p style="font-size: 14px; color: #7f8c8d;">Cảm ơn bạn đã mua sắm tại <strong style="color: #2c3e50;">Táo Bro</strong>! 💚</p>
    </div>
  `;

  const mailOptions = {
    from: `"Cửa hàng Táo Bro" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `🧾 Xác nhận đơn hàng #${id_order}`,
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
