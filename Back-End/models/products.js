module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id_products: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    products_sale_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    products_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    products_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'products',
    timestamps: false,
  });

  return Product;
};
