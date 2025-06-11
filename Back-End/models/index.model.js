const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

// Import các model
const Contact = require('./contact')(sequelize, DataTypes);
const Banner = require('./banner')(sequelize, DataTypes);
const Category = require('./categories')(sequelize, DataTypes);
const Customer = require('./customers')(sequelize, DataTypes);
const Product = require('./products')(sequelize, DataTypes);
const Employee = require('./employees')(sequelize, DataTypes);
const Address = require('./userAddress')(sequelize, DataTypes);
const ProductImg = require('./productImage')(sequelize, DataTypes);
const ProductSpec = require('./productSpec')(sequelize, DataTypes);
const Attribute = require('./Attribute')(sequelize, DataTypes);
const AttributeValue = require('./AttributeValue')(sequelize, DataTypes);
const ProductAttribute = require('./productAttribute')(sequelize, DataTypes);
const ProductVariant = require('./productVariant')(sequelize, DataTypes);
const VariantValue = require('./variantValue')(sequelize, DataTypes);
// Khởi tạo object db
const db = {
  sequelize,
  Sequelize,

  // Models
  Contact,
  Banner,
  Category,
  Customer,
  Employee,
  Address,
  Product,
  ProductImg,
  ProductSpec,
  Attribute,
  AttributeValue,
  ProductAttribute,
  ProductVariant,
  VariantValue,
};

/* =========================
   Thiết lập Associations
========================= */

// Danh mục cha - con
db.Category.belongsTo(db.Category, {
  foreignKey: 'parent_id',
  as: 'parent',
});
db.Category.hasMany(db.Category, {
  foreignKey: 'parent_id',
  as: 'children',
});

// Danh mục - Sản phẩm
db.Category.hasMany(db.Product, {
  foreignKey: 'category_id',
  as: 'products',
});
db.Product.belongsTo(db.Category, {
  foreignKey: 'category_id',
  as: 'category',
});

// Sản phẩm - Ảnh sản phẩm
db.Product.hasMany(db.ProductImg, {
  foreignKey: 'id_products',
  as: 'images',
});
db.ProductImg.belongsTo(db.Product, {
  foreignKey: 'id_products',
  as: 'product',
});

// Sản phẩm - Thông số kỹ thuật
db.Product.hasMany(db.ProductSpec, {
  foreignKey: 'id_products',
  as: 'specs',
});
db.ProductSpec.belongsTo(db.Product, {
  foreignKey: 'id_products',
  as: 'product',
});

// Khách hàng - Địa chỉ
db.Customer.hasMany(db.Address, {
  foreignKey: 'id_customer',
  as: 'addresses',
});
db.Address.belongsTo(db.Customer, {
  foreignKey: 'id_customer',
  as: 'customer',
});

db.Product.hasMany(db.ProductVariant, {
  foreignKey: 'id_products',
  as: 'variants',
});
db.ProductVariant.belongsTo(db.Product, {
  foreignKey: 'id_products',
  as: 'product',
});

db.Product.hasMany(db.ProductAttribute, {
  foreignKey: 'id_product',
  as: 'productAttributes',
});
db.ProductAttribute.belongsTo(db.Product, {
  foreignKey: 'id_product',
  as: 'product',
});

db.Attribute.hasMany(db.ProductAttribute, {
  foreignKey: 'id_attribute',
  as: 'productAttributes',
});
db.ProductAttribute.belongsTo(db.Attribute, {
  foreignKey: 'id_attribute',
  as: 'attribute',
});

db.ProductVariant.hasMany(db.VariantValue, {
  foreignKey: 'id_variant',
  as: 'variantValues',
});
db.VariantValue.belongsTo(db.ProductVariant, {
  foreignKey: 'id_variant',
  as: 'variant',
});

db.AttributeValue.hasMany(db.VariantValue, {
  foreignKey: 'id_value',
  as: 'usedInVariants',
});
db.VariantValue.belongsTo(db.AttributeValue, {
  foreignKey: 'id_value',
  as: 'attributeValue',
});

// Ảnh sản phẩm - gắn với biến thể
db.ProductVariant.hasMany(db.ProductImg, {
  foreignKey: 'id_variant',
  as: 'images',
});
db.ProductImg.belongsTo(db.ProductVariant, {
  foreignKey: 'id_variant',
  as: 'variant',
});

// Ảnh sản phẩm - gắn với giá trị thuộc tính (option cụ thể)
db.AttributeValue.hasMany(db.ProductImg, {
  foreignKey: 'id_value',
  as: 'images',
});
db.ProductImg.belongsTo(db.AttributeValue, {
  foreignKey: 'id_value',
  as: 'value',
});

module.exports = db;