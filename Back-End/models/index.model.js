const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ContactModel = require('./contact')(sequelize, DataTypes);

const BannerModel = require('./banner')(sequelize, DataTypes);

const CategoriesModel = require('./categories')(sequelize, DataTypes);

const CustomerModel = require('./customers')(sequelize, DataTypes);

const ProductModel = require('./products')(sequelize, DataTypes);

const EmployeeModel = require('./employees')(sequelize, DataTypes);

const db = {
  sequelize,
  Sequelize,
  Contact: ContactModel,
  Banner: BannerModel,
  Category: CategoriesModel,
  Customer: CustomerModel,
  Product: ProductModel,
  Empolyee: EmployeeModel,
};

db.Category.hasMany(db.Product, {
  foreignKey: 'category_id',
  as: 'products'
});

db.Product.belongsTo(db.Category, {
  foreignKey: 'category_id',
  as: 'category'
});

module.exports = db;
