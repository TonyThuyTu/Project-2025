module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    img: {
      type: DataTypes.STRING(225),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // false: hiện
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // false: không hiển thị trang chủ
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'category_id',
      },
    },
  }, {
    tableName: 'categories',
    timestamps: false,
  });

  return Category;
};
