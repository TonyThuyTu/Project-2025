const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ContactModel = require('./contact')(sequelize, DataTypes);

const BannerModel = require('./banner')(sequelize, DataTypes);

const CategoriesModel = require('./categories')(sequelize, DataTypes);

const CustomerModel = require('./customers')(sequelize, DataTypes);

const ProductModel = require('./products')(sequelize, DataTypes);

const EmployeeModel = require('./employees')(sequelize, DataTypes);

const Address = require('./userAddress')(sequelize, DataTypes);

const db = {
  sequelize,
  Sequelize,
  Contact: ContactModel,
  Banner: BannerModel,
  Category: CategoriesModel,
  Customer: CustomerModel,
  Product: ProductModel,
  Employee: EmployeeModel,
  Address: Address,
};

db.Category.hasMany(db.Product, {
  foreignKey: 'category_id',
  as: 'products'
});

db.Product.belongsTo(db.Category, {
  foreignKey: 'category_id',
  as: 'category'
});

// Thiết lập quan hệ: Một khách hàng có nhiều địa chỉ
db.Customer.hasMany(db.Address, {
  foreignKey: 'id_customer',
  as: 'addresses'
});

db.Address.belongsTo(db.Customer, {
  foreignKey: 'id_customer',
  as: 'customer'
});


module.exports = db;
