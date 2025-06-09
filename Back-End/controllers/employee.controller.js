const db = require('../models/index.model');
const bcrypt = require('bcryptjs');
const Employee = db.Employee;
const employeeToken = require('../middlewares/tokenForStaff');
const { Op } =  require('sequelize'); 
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; 
    // identifier có thể là email hoặc phone

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Phone và mật khẩu là bắt buộc' });
      
    }

    // Tìm nhân viên theo email hoặc phone
    const employee = await Employee.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    console.log('Đang tìm với:', identifier);

    if (!employee) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại' });
    }

    // Kiểm tra trạng thái block
    if (employee.block === true || employee.block === 1) {
        return res.status(403).json({ error: 'Tài khoản đã bị chặn. Lý do: ' + (employee.block_reason || 'Không có lý do') });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác' });
    }

    // Tạo JWT token (ví dụ thời hạn 2 giờ)
    const payload = {
      id_employee: employee.id_employee,
      employee_name: employee.name,
      employee_role: employee.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '2h' });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      employee: {
        id_employee: employee.id_employee,
        employee_name: employee.name,
        employee_email: employee.email,
        employee_phone: employee.phone,
        employee_role: employee.role,
        employee_status: employee.status,
        employee_block: employee.block,
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách nhân viên
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({ order: [['id_employee', 'DESC']] });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy nhân viên theo ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Thêm nhân viên
exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      gender,
      phone,
      email,
      password,
      position,
      status,
      role,
      block_reason
    } = req.body;

    // Check email đã tồn tại chưa
    const emailExists = await Employee.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ error: 'Email này đã được sử dụng' });
    }

    // Check phone đã tồn tại chưa
    const phoneExists = await Employee.findOne({ where: { phone } });
    if (phoneExists) {
      return res.status(400).json({ error: 'Số điện thoại này đã được sử dụng' });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo mới nhân viên
    const newEmployee = await Employee.create({
      name,
      gender,
      phone,
      email,
      password: hashedPassword,
      position,
      status: '1',  // mặc định trạng thái '1'
      role,
      block: false,
      block_reason: block_reason || '',
      created_at: new Date(),
    });

    // Tạo token cho nhân viên mới
    const token = employeeToken(newEmployee);

    // Trả về nhân viên + token
    res.status(201).json({ employee: newEmployee, token });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: error.message });
  }
};


// Cập nhật nhân viên
exports.updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = { ...req.body };

    // Xoá không cho cập nhật các trường chặn
    delete updatedData.block;
    delete updatedData.block_reason;

    // Không cho cập nhật role (role chỉ được set ban đầu)
    delete updatedData.role;

    // Kiểm tra trùng email hoặc phone (ngoại trừ chính nhân viên này)
    const existing = await Employee.findOne({
      where: {
        id_employee: { [Op.ne]: id },
        [Op.or]: [
          { email: updatedData.email },
          { phone: updatedData.phone }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Email hoặc số điện thoại đã được sử dụng bởi nhân viên khác' });
    }

    // Nếu có mật khẩu mới thì hash lại
    if (updatedData.password || updatedData.employee_password) {
      // Tùy biến tên trường pass trên FE hay BE
      const passField = updatedData.password ? 'password' : 'employee_password';
      updatedData[passField] = await bcrypt.hash(updatedData[passField], 10);
    }

    // Cập nhật
    const [updated] = await Employee.update(updatedData, {
      where: { id_employee: id }
    });

    if (updated === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để cập nhật' });
    }

    return res.json({ message: 'Cập nhật nhân viên thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật nhân viên:', error);
    return res.status(500).json({ error: error.message });
  }
};


// Block hoặc un-block nhân viên
exports.blockEmployee = async (req, res) => {
  const id = req.params.id;
  let { block, reason } = req.body;
  block = Number(block);

  try {
    const employee = await Employee.findByPk(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    if (employee.role === 1) {
      return res.status(403).json({ message: "Super Admin cannot be blocked" });
    }

    if (block === 1) { // chặn
      employee.block = true;
      employee.block_reason = reason || "Không có lý do";
      employee.status = '3'; // nghỉ việc
    } else if (block === 2) { // bỏ chặn
      employee.block = false;
      employee.block_reason = '';
      if (employee.status === '3') {
        employee.status = '1'; // quay lại đi làm
      }
    } else {
      return res.status(400).json({ message: "Giá trị block không hợp lệ" });
    }

    await employee.save();
    res.json({ message: "Employee block status updated", employee });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
