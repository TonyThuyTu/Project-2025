module.exports = (sequelize, DataTypes) => {
  const VariantValue = sequelize.define("variant_values", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_variant: DataTypes.INTEGER,
    id_value: DataTypes.INTEGER,
  });
  return VariantValue;
};