module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id_employee: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    empolyee_sex: {
      type: DataTypes.INTEGER,
      allowNull: false, // 1: Nam, 2: Nữ
    },
    employee_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    employee_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    employee_password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    employee_position: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    employee_status: {
      type: DataTypes.ENUM('1', '2', '3'), // 1: đi làm, 2: nghỉ phép, 3: nghỉ việc
      defaultValue: '1',
    },
    employee_role: {
      type: DataTypes.INTEGER, // 1: Super Admin, 2: Seller
      allowNull: false,
    },
    employee_block: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    block_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    employee_created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'employees',
    timestamps: false,
  });

  return Employee;
};
