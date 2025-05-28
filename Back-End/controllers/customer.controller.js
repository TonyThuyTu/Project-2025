const db = require('../models/index.model');
const Customer = db.Customer;
const bcrypt = require('bcryptjs');
const generateToken = require('../middlewares/auth');
const { sendOTPByEmail } = require('../helper/sendMail');
const redisClient = require('../config/redisClient');

// Lấy danh sách tất cả khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json({ customers });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy khách hàng theo ID
exports.getCustomerById = async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    res.json({ customer });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin khách hàng
exports.updateCustomer = async (req, res) => {
  const id = req.params.id;
  const { customer_name, customer_phone, customer_email } = req.body;

  if (!customer_name || !customer_phone || !customer_email) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  try {
    // Kiểm tra email/SĐT trùng với khách hàng khác
    const duplicate = await Customer.findOne({
      where: {
        customer_email,
        id_customer: { [db.Sequelize.Op.ne]: id }
      }
    });
    if (duplicate) {
      return res.status(400).json({ message: 'Email đã được sử dụng bởi người khác' });
    }

    const duplicatePhone = await Customer.findOne({
      where: {
        customer_phone,
        id_customer: { [db.Sequelize.Op.ne]: id }
      }
    });
    if (duplicatePhone) {
      return res.status(400).json({ message: 'Số điện thoại đã được sử dụng bởi người khác' });
    }

    const [updated] = await Customer.update(
      { customer_name, customer_phone, customer_email },
      { where: { id_customer: id } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    res.json({ message: 'Cập nhật khách hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật thông tin', error: error.message });
  }
};

// Chặn hoặc mở chặn khách hàng
exports.toggleCustomerStatus = async (req, res) => {
  const customerId = req.params.id;
  const { status, block_reason } = req.body; // Nhận thêm block_reason

  // Kiểm tra giá trị status hợp lệ
  if (![true, false, 1, 0].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ. Chỉ nhận true/false hoặc 1/0.' });
  }

  // Tạo dữ liệu cập nhật
  const updateData = {
    customer_status: status === 1 || status === true
  };

  // Nếu chặn thì lưu lý do chặn, nếu mở chặn thì xóa lý do
  if (status === false || status === 0) {
    updateData.block_reason = block_reason || 'Không rõ lý do';
  } else {
    updateData.block_reason = ''; // Gỡ lý do khi mở chặn
  }

  try {
    const [updated] = await Customer.update(updateData, {
      where: { id_customer: customerId }
    });

    if (updated === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    const statusMessage = updateData.customer_status
      ? 'Khách hàng đã được mở chặn'
      : 'Khách hàng đã bị chặn';

    res.json({ message: statusMessage });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi cập nhật trạng thái khách hàng',
      error: error.message
    });
  }
};


// Đăng ký khách hàng
exports.register = async (req, res) => {
  const { customer_name, customer_phone, customer_email, customer_password } = req.body;

  if (!customer_name || !customer_phone || !customer_email || !customer_password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  try {
    // Kiểm tra trùng email hoặc điện thoại
    const existsEmail = await Customer.findOne({ where: { customer_email } });
    if (existsEmail) return res.status(409).json({ message: 'Email đã tồn tại' });

    const existsPhone = await Customer.findOne({ where: { customer_phone } });
    if (existsPhone) return res.status(409).json({ message: 'Số điện thoại đã tồn tại' });

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(customer_password, 10);

    // Tạo khách hàng mới
    const newCustomer = await Customer.create({
      customer_name,
      customer_phone,
      customer_email,
      customer_password: hashedPassword,
      customer_status: true,
    });

    const token = generateToken(newCustomer);

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      customer: {
        id_customer: newCustomer.id_customer,
        customer_name: newCustomer.customer_name,
        customer_email: newCustomer.customer_email,
        customer_phone: newCustomer.customer_phone,
        customer_status: newCustomer.customer_status,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Đăng ký thất bại', error: error.message });
  }
};

// Đăng nhập khách hàng
exports.login = async (req, res) => {
  const { phoneOrEmail, password } = req.body;

  if (!phoneOrEmail || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  try {
    // Tìm user theo email hoặc điện thoại
    let user = await Customer.findOne({ where: { customer_email: phoneOrEmail } });
    if (!user) {
      user = await Customer.findOne({ where: { customer_phone: phoneOrEmail } });
      if (!user) {
        return res.status(404).json({ message: 'Tài khoản không tồn tại' });
      }
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.customer_password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Sai mật khẩu' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Đăng nhập thành công',
      token,
      customer: {
        id_customer: user.id_customer,
        customer_name: user.customer_name,
        customer_email: user.customer_email,
        customer_phone: user.customer_phone,
        customer_status: user.customer_status,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Gửi OTP cho email hoặc số điện thoại
exports.sendOTP = async (req, res) => {
  const { phoneOrEmail } = req.body;
  if (!phoneOrEmail) {
    return res.status(400).json({ message: 'Vui lòng nhập email hoặc số điện thoại' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // 6 số
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

  try {
    let user = await Customer.findOne({ where: { customer_email: phoneOrEmail } });

    if (!user) {
      user = await Customer.findOne({ where: { customer_phone: phoneOrEmail } });
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }
      // Gửi OTP qua SMS (giả lập)
      await redisClient.set(phoneOrEmail, JSON.stringify({ otp, expiresAt }), { EX: 300 });
      return res.json({ message: 'OTP đã được gửi đến số điện thoại (demo: gửi thành công)' });
    } else {
      // Gửi OTP qua Email
      await sendOTPByEmail(phoneOrEmail, otp, user.customer_name);
      await redisClient.setEx(phoneOrEmail, 300, JSON.stringify({ otp, expiresAt }));
      return res.json({ message: 'OTP đã được gửi đến email' });
    }
  } catch (error) {
    console.error('❌ Lỗi khi gửi OTP:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xác thực OTP
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

    res.json({ message: 'OTP hợp lệ. Bạn có thể đổi mật khẩu.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đổi mật khẩu sau khi xác thực OTP
exports.resetPassword = async (req, res) => {
  const { phoneOrEmail, newPassword } = req.body;

  try {
    const data = await redisClient.get(phoneOrEmail);
    if (!data) return res.status(400).json({ message: 'Vui lòng xác thực OTP trước' });

    const parsed = JSON.parse(data);
    if (!parsed.verified) return res.status(400).json({ message: 'Vui lòng xác thực OTP trước' });

    // Tìm user
    let user = await Customer.findOne({ where: { customer_email: phoneOrEmail } });
    if (!user) {
      user = await Customer.findOne({ where: { customer_phone: phoneOrEmail } });
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    await Customer.update({ customer_password: hashedPassword }, { where: { id_customer: user.id_customer } });

    // Xóa key redis sau khi đổi mật khẩu thành công
    await redisClient.del(phoneOrEmail);

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};