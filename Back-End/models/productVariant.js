module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define("product_variants", {
    id_variant: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_products: DataTypes.INTEGER,
    sku: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    quantity: DataTypes.INTEGER,
    status: { type: DataTypes.BOOLEAN, defaultValue: true },
  });
  return ProductVariant;
};