module.exports = (sequelize, DataTypes) => {
  const Attribute = sequelize.define("Attribute", {
    id_attribute: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: "attributes",
    timestamps: false,
  });

  return Attribute;
};
