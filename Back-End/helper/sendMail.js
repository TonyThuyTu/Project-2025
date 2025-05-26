const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',  // dùng service gmail cho nhanh
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function sendOTPByEmail(toEmail, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Mã OTP của bạn',
    text: `Mã OTP của bạn là: ${otp}`
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOTPByEmail };
