module.exports = (sequelize, DataTypes) => {
    const ProductSpec = sequelize.define("product_spec", {
    id_spec: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_products: DataTypes.INTEGER,
    spec_title: DataTypes.STRING,
    spec_name: DataTypes.STRING,
    spec_value: DataTypes.STRING,
    }, {
    tableName: 'product_spec',   // đúng tên bảng trong DB
    timestamps: false,           // nếu DB không có createdAt, updatedAt
    });

  return ProductSpec;
};