module.exports = (sequelize, DataTypes) => {
  const ProductAttribute = sequelize.define("product_attributes", {
    id_product_attribute: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_product: DataTypes.INTEGER,
    id_attribute: DataTypes.INTEGER,
  }, {
    tableName: 'product_attributes',
    timestamps: false,  // Tắt createdAt, updatedAt
  });
  return ProductAttribute;
};
