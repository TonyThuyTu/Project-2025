module.exports = (sequelize, DataTypes) => {
  const Attribute = sequelize.define("attributes", {
    id_attribute: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
  });
  return Attribute;
};