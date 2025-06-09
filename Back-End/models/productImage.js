module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define("Product_img", {
    id_product_img: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_products: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_variant: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Img_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_main: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: false,
    tableName: "product_img",
  });

  return ProductImage;
};
