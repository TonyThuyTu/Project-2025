const Customer = require('../models/customers');
const bcrypt = require('bcryptjs');
const generateToken = require('../middlewares/auth');
const { sendOTPByEmail } = require('../helper/sendMail');
const redisClient = require('../config/redisClient');


//Lấy danh sách 
exports.getAllCustomers = (req, res) => {
  Customer.getAll((err, results) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách khách hàng:', err);
      return res.status(500).json({ message: 'Lỗi server' });
    }

    res.json({ customers: results });
  });
};

//Lấy danh sách dựa theo id
exports.getCustomerById = (req, res) => {
  const customerId = req.params.id;

  Customer.findById(customerId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Lỗi server' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    res.json({ customer: results[0] });
  });
};

// chỉnh sửa thông tin 
exports.updateCustomer = (req, res) => {
  const id = req.params.id;
  const { customer_name, customer_phone, customer_email } = req.body;

  if (!customer_name || !customer_phone || !customer_email) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  // Kiểm tra trùng email/SĐT ở khách khác
  Customer.checkDuplicateEmailOrPhone(customer_email, customer_phone, id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Lỗi kiểm tra email/SĐT' });

    if (result.length > 0) {
      return res.status(400).json({ message: 'Email hoặc số điện thoại đã được sử dụng bởi người khác' });
    }

    // Cập nhật
    const updatedData = { customer_name, customer_phone, customer_email };

    Customer.updateById(id, updatedData, (err, result) => {
      if (err) return res.status(500).json({ message: 'Lỗi khi cập nhật thông tin' });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
      }

      res.json({ message: 'Cập nhật khách hàng thành công' });
    });
  });
};

//chặn khách hàng
exports.toggleCustomerStatus = (req, res) => {
    const customerId = req.params.id;
    const { status } = req.body;

    if (status !== 1 && status !== 2) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ. Chỉ nhận 1 (mở chặn) hoặc 2 (chặn).' });
    }

    Customer.updateStatusById(customerId, status, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái khách hàng', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }

        const statusMessage = status === 2 ? 'Khách hàng đã bị chặn' : 'Khách hàng đã được mở chặn';
        res.json({ message: statusMessage });
    });
};


// Đăng ký
exports.register = (req, res) => {
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
exports.login = (req, res) => {
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

exports.sendOTP = async (req, res) => {
  const { phoneOrEmail } = req.body;
  if (!phoneOrEmail) {
    return res.status(400).json({ message: 'Vui lòng nhập email hoặc số điện thoại' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // random 6 số
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

  try {
    const emailResult = await new Promise((resolve, reject) => {
      Customer.findByEmail(phoneOrEmail, (err, result) => err ? reject(err) : resolve(result));
    });

    if (emailResult.length === 0) {
      const phoneResult = await new Promise((resolve, reject) => {
        Customer.findByPhone(phoneOrEmail, (err, result) => err ? reject(err) : resolve(result));
      });

      if (phoneResult.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }

      await redisClient.set(phoneOrEmail, JSON.stringify({ otp, expiresAt }), { EX: 300 });


      return res.json({ message: 'OTP đã được gửi đến số điện thoại (demo: gửi thành công)' });
    } else {
      const customerName = emailResult[0]?.customer_name;

      await sendOTPByEmail(phoneOrEmail, otp, customerName);
      await redisClient.setEx(phoneOrEmail, 300, JSON.stringify({ otp, expiresAt }));

      return res.json({ message: 'OTP đã được gửi đến email' });
    }
  } catch (error) {
    console.error('❌ Lỗi khi gửi OTP:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phoneOrEmail, otp } = req.body;

  try {
    const data = await redisClient.get(phoneOrEmail);
    if (!data) return res.status(400).json({ message: 'Không tìm thấy mã OTP' });

    const { otp: savedOtp, expiresAt } = JSON.parse(data);

    if (Date.now() > expiresAt) {
      await redisClient.del(phoneOrEmail);
      return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
    }

    if (!savedOtp || otp !== savedOtp.toString()) {
      return res.status(400).json({ message: 'Mã OTP không đúng' });
    }

    // Xác thực thành công -> set lại Redis với `verified: true`
    await redisClient.setEx(phoneOrEmail, 300, JSON.stringify({ verified: true }));

    return res.json({ message: 'OTP hợp lệ. Bạn có thể đổi mật khẩu.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { phoneOrEmail, newPassword } = req.body;

  try {
    const data = await redisClient.get(phoneOrEmail);
    if (!data) return res.status(400).json({ message: 'Bạn chưa xác thực OTP' });

    const { verified } = JSON.parse(data);
    if (!verified) {
      return res.status(400).json({ message: 'Bạn chưa xác thực OTP' });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await new Promise((resolve, reject) => {
      Customer.updatePassword(phoneOrEmail, hash, (err, result) => err ? reject(err) : resolve(result));
    });

    await redisClient.del(phoneOrEmail); // Xóa OTP khỏi Redis

    return res.json({ message: 'Mật khẩu đã được thay đổi thành công' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật mật khẩu', error: error.message });
  }
};



