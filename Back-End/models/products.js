module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("products", {
    id_products: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    products_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    products_market_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    products_sale_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    products_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    products_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    products_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'products',
    timestamps: false,  // hoặc false nếu bạn không dùng createdAt, updatedAt
  });

  return Product;
};
