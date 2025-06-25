module.exports = (sequelize, DataTypes) => {
  const Voucher = sequelize.define('Voucher', {
    id_voucher: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    discount_type: {
      type: DataTypes.ENUM('percent', 'fixed'),
      allowNull: false
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    min_order_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    user_limit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT, // 1: chờ duyệt, 2: hiển thị, 3: ẩn
      defaultValue: 1
    }
  }, {
    tableName: 'vouchers',
    timestamps: false
  });

  return Voucher;
};
