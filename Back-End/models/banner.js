module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define('Banner', {
    id_banner: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    banner_img: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'Banner',
    timestamps: false
  });

  return Banner;
};
