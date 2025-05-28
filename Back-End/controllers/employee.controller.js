const db = require('../models/index.model');
const bcrypt = require('bcryptjs');
const Employee = db.Empolyee;
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
          { employee_email: identifier },
          { employee_phone: identifier }
        ]
      }
    });

    console.log('Đang tìm với:', identifier);

    if (!employee) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại' });
    }

    // Kiểm tra trạng thái block
    if (employee.employee_block === true || employee.employee_block === 1) {
        return res.status(403).json({ error: 'Tài khoản đã bị chặn. Lý do: ' + (employee.block_reason || 'Không có lý do') });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, employee.employee_password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác' });
    }

    // Tạo JWT token (ví dụ thời hạn 2 giờ)
    const payload = {
      id_employee: employee.id_employee,
      employee_name: employee.employee_name,
      employee_role: employee.employee_role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '2h' });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      employee: {
        id_employee: employee.id_employee,
        employee_name: employee.employee_name,
        employee_email: employee.employee_email,
        employee_phone: employee.employee_phone,
        employee_role: employee.employee_role,
        employee_status: employee.employee_status,
        employee_block: employee.employee_block,
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
      employee_name,
      empolyee_sex,
      employee_phone,
      employee_email,
      employee_password,
      employee_position,
      employee_status,
      employee_role
    } = req.body;

    // Check email đã tồn tại chưa
    const emailExists = await Employee.findOne({ where: { employee_email } });
    if (emailExists) {
      return res.status(400).json({ error: 'Email này đã được sử dụng' });
    }

    // Check phone đã tồn tại chưa
    const phoneExists = await Employee.findOne({ where: { employee_phone } });
    if (phoneExists) {
      return res.status(400).json({ error: 'Số điện thoại này đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(employee_password, 10);

    const newEmployee = await Employee.create({
      employee_name,
      empolyee_sex,
      employee_phone,
      employee_email,
      employee_password: hashedPassword,
      employee_position,
      employee_status: employee_status || 1,  // Mặc định là 1 nếu không truyền
      employee_role,
      employee_block: false,
      block_reason: req.body.block_reason || '', 
    });

    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật nhân viên
exports.updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    if (updatedData.employee_password) {
      updatedData.employee_password = await bcrypt.hash(updatedData.employee_password, 10);
    }

    const [updated] = await Employee.update(updatedData, { where: { id_employee: id } });
    if (updated === 0) return res.status(404).json({ message: 'Employee not found' });

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Block hoặc un-block nhân viên
exports.blockEmployee = async (req, res) => {
  const id = req.params.id;
  const { block, reason } = req.body; // block = 1 (chặn), 2 (bỏ chặn)

  try {
    const employee = await Employee.findByPk(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    if (employee.employee_role === 1) {
      // Nếu là Super Admin thì không cho chặn
      return res.status(403).json({ message: "Super Admin cannot be blocked" });
    }

    if (block === 1) { // chặn
        employee.employee_block = true;
        employee.block_reason = reason || "Không có lý do";
        employee.employee_status = 3;

    } else if (block === 2) { // bỏ chặn
        employee.employee_block = false;
        employee.block_reason = reason || "";
    if (employee.employee_status === 3) {
        employee.employee_status = 1;
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