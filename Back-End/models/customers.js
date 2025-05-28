module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id_customer: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    customer_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    customer_password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    customer_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    block_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
  }, {
    tableName: 'customers',  // chú ý tên bảng viết thường
    timestamps: false,
  });

  return Customer;
};
