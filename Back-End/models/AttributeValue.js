module.exports = (sequelize, DataTypes) => {
  const AttributeValue = sequelize.define("attribute_values", {
    id_value: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_attribute: DataTypes.INTEGER,
    value: DataTypes.STRING,
    extra_price: DataTypes.DECIMAL(10, 2),
    status: { type: DataTypes.BOOLEAN, defaultValue: true },
  });
  return AttributeValue;
};