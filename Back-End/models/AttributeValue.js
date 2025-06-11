module.exports = (sequelize, DataTypes) => {
  const AttributeValue = sequelize.define("AttributeValue", {
    id_value: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_attribute: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    quantity: DataTypes.INTEGER,
    extra_price: DataTypes.DECIMAL(10, 2),
    status: DataTypes.BOOLEAN,
  }, {
    tableName: "attribute_values",
    timestamps: false,
  });

  return AttributeValue;
};
