const Customer = require('../models/customers');
const bcrypt = require('bcryptjs');
const generateToken = require('../middlewares/auth');
const { sendOTPByEmail } = require('../helper/sendMail');


// Đăng ký
const register = (req, res) => {
  const { customer_name, customer_phone, customer_email, customer_password } = req.body;

  if (!customer_name || !customer_phone || !customer_email || !customer_password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  // Kiểm tra email
  Customer.findByEmail(customer_email, (err, result) => {
    if (err) return res.status(500).json({ message: 'Lỗi server' });
    if (result.length > 0) return res.status(409).json({ message: 'Email đã tồn tại' });

    // Kiểm tra SĐT
    Customer.findByPhone(customer_phone, (err, phoneResult) => {
      if (err) return res.status(500).json({ message: 'Lỗi server' });
      if (phoneResult.length > 0) return res.status(409).json({ message: 'Số điện thoại đã tồn tại' });

      // Tạo người dùng
      Customer.create({ customer_name, customer_phone, customer_email, customer_password }, (err, createResult) => {
        if (err) return res.status(500).json({ message: 'Đăng ký thất bại' });

        // Lấy lại user vừa tạo để tạo token
        Customer.findByEmail(customer_email, (err, userResult) => {
          if (err || userResult.length === 0) {
            return res.status(500).json({ message: 'Lỗi xác thực sau đăng ký' });
          }

          const user = userResult[0];
          const token = generateToken(user);

          return res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            customer: {
              id_customer: user.id_customer,
              customer_name: user.customer_name,
              customer_email: user.customer_email,
              customer_phone: user.customer_phone,
              customer_status: user.customer_status
            }
          });
        });
      });
    });
  });
};

// Đăng nhập
const login = (req, res) => {
  const { phoneOrEmail, password } = req.body;

  if (!phoneOrEmail || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  // Tìm theo email trước
  Customer.findByEmail(phoneOrEmail, (err, emailResult) => {
    if (err) return res.status(500).json({ message: 'Lỗi server' });

    if (emailResult.length > 0) {
      const user = emailResult[0];
      return checkPasswordAndLogin(user, password, res);
    }

    // Nếu không có email thì tìm theo số điện thoại
    Customer.findByPhone(phoneOrEmail, (err, phoneResult) => {
      if (err) return res.status(500).json({ message: 'Lỗi server' });

      if (phoneResult.length > 0) {
        const user = phoneResult[0];
        return checkPasswordAndLogin(user, password, res);
      }

      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    });
  });
};

// Hàm check password & trả về token nếu đúng
const checkPasswordAndLogin = (user, password, res) => {
  bcrypt.compare(password, user.customer_password, (err, isMatch) => {
    if (err) return res.status(500).json({ message: 'Lỗi so sánh mật khẩu' });

    if (!isMatch) {
      return res.status(401).json({ message: 'Sai mật khẩu' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      customer: {
        id_customer: user.id_customer,
        customer_name: user.customer_name,
        customer_email: user.customer_email,
        customer_phone: user.customer_phone,
        customer_status: user.customer_status
      }
    });
  });
};

// Quên mật khẩu - OTP
// Bước 1 gữi OTP
const otpMap = new Map(); // Map tạm, nên lưu vào DB nếu production

const sendOTP = (req, res) => {
  const { phoneOrEmail } = req.body;
  if (!phoneOrEmail) return res.status(400).json({ message: 'Vui lòng nhập email hoặc số điện thoại' });

  const otp = Math.floor(100000 + Math.random() * 900000); // random 6 số
  const expiresAt = Date.now() + 5 * 60 * 1000; // hết hạn sau 5 phút

  // Tìm người dùng
  Customer.findByEmail(phoneOrEmail, (err, result) => {
    if (err) return res.status(500).json({ message: 'Lỗi server' });

    if (result.length === 0) {
      // Nếu không phải email thì thử với phone
      Customer.findByPhone(phoneOrEmail, (err, resultPhone) => {
        if (err || resultPhone.length === 0) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

        // Gửi OTP bằng SMS nếu cần (sau này triển khai)
        otpMap.set(phoneOrEmail, { otp, expiresAt });
        return res.json({ message: 'OTP đã được gửi đến số điện thoại (demo: gửi thành công)' });
      });
    } else {
      // Gửi OTP qua email
      sendOTPByEmail(phoneOrEmail, otp)
        .then(() => {
          otpMap.set(phoneOrEmail, { otp, expiresAt });
          return res.json({ message: 'OTP đã được gửi đến email' });
        })
        .catch(() => res.status(500).json({ message: 'Không gửi được email' }));
    }
  });
};

//Xác minh OTP
const verifyOTP = (req, res) => {
  const { phoneOrEmail, otp } = req.body;
  const entry = otpMap.get(phoneOrEmail);

  if (!entry) return res.status(400).json({ message: 'Không tìm thấy mã OTP' });

  const { otp: savedOtp, expiresAt } = entry;

  if (Date.now() > expiresAt) {
    otpMap.delete(phoneOrEmail);
    return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
  }

  if (otp !== savedOtp.toString()) {
    return res.status(400).json({ message: 'Mã OTP không đúng' });
  }

  // Lưu trạng thái xác thực thành công (đơn giản hóa: đánh dấu trong map)
  otpMap.set(phoneOrEmail, { verified: true });
  return res.json({ message: 'OTP hợp lệ. Bạn có thể đổi mật khẩu.' });
};

// Reset Pass
const resetPassword = (req, res) => {
  const { phoneOrEmail, newPassword } = req.body;
  const otpStatus = otpMap.get(phoneOrEmail);

  if (!otpStatus || otpStatus.verified !== true) {
    return res.status(400).json({ message: 'Bạn chưa xác thực OTP' });
  }

  bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) return res.status(500).json({ message: 'Lỗi khi mã hóa mật khẩu' });

    // Cập nhật mật khẩu mới
    Customer.updatePassword(phoneOrEmail, hash, (err, result) => {
      if (err) return res.status(500).json({ message: 'Lỗi khi cập nhật mật khẩu' });

      otpMap.delete(phoneOrEmail); // Xóa OTP sau khi dùng
      return res.json({ message: 'Mật khẩu đã được thay đổi thành công' });
    });
  });
};



module.exports = { 
    register, 
    login, 
    verifyOTP, 
    sendOTP, 
    resetPassword 
};
