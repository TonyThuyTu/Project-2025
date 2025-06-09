const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ContactModel = require('./contact')(sequelize, DataTypes);

const BannerModel = require('./banner')(sequelize, DataTypes);

const CategoriesModel = require('./categories')(sequelize, DataTypes);

const CustomerModel = require('./customers')(sequelize, DataTypes);

const ProductModel = require('./products')(sequelize, DataTypes);

const EmployeeModel = require('./employees')(sequelize, DataTypes);

const Address = require('./userAddress')(sequelize, DataTypes);

const ProductSpecModel = require('./productSpec')(sequelize, DataTypes);

const AttributeModel = require('./Attribute')(sequelize, DataTypes);

const AttributeValueModel = require('./AttributeValue')(sequelize, DataTypes);

const ProductAttributeModel = require('./productAttribute')(sequelize, DataTypes);

const ProductVariantModel = require('./productVariant')(sequelize, DataTypes);

const VariantValueModel = require('./variantValue')(sequelize, DataTypes);

const ProductImgModel = require('./productImage')(sequelize, DataTypes);



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
  ProductSpec: ProductSpecModel,
  Attribute: AttributeModel,
  AttributeValue: AttributeValueModel,
  ProductAttribute: ProductAttributeModel,
  ProductVariant: ProductVariantModel,
  VariantValue: VariantValueModel,
  ProductImg: ProductImgModel,

};

db.Category.hasMany(db.Product, {
  foreignKey: 'category_id',
  as: 'products'
});

db.Category.belongsTo(db.Category, {
  foreignKey: 'parent_id',
  as: 'parent',
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

// Product -> ProductSpec
db.Product.hasMany(db.ProductSpec, { foreignKey: 'id_products', as: 'specs' });
db.ProductSpec.belongsTo(db.Product, { foreignKey: 'id_products' });

// Product -> ProductAttribute
db.Product.hasMany(db.ProductAttribute, { foreignKey: 'id_product', as: 'productAttributes' });
db.ProductAttribute.belongsTo(db.Product, { foreignKey: 'id_product' });

// Attribute -> AttributeValue
db.Attribute.hasMany(db.AttributeValue, { foreignKey: 'id_attribute', as: 'values' });
db.AttributeValue.belongsTo(db.Attribute, { foreignKey: 'id_attribute' });

// Product -> ProductVariant
db.Product.hasMany(db.ProductVariant, { foreignKey: 'id_products', as: 'variants' });
db.ProductVariant.belongsTo(db.Product, { foreignKey: 'id_products' });

// ProductVariant -> VariantValue
db.ProductVariant.hasMany(db.VariantValue, { foreignKey: 'id_variant', as: 'variantValues' });
db.VariantValue.belongsTo(db.ProductVariant, { foreignKey: 'id_variant' });

// AttributeValue -> VariantValue
db.AttributeValue.hasMany(db.VariantValue, { foreignKey: 'id_value' });
db.VariantValue.belongsTo(db.AttributeValue, { foreignKey: 'id_value' });

// Product -> ProductImg
db.Product.hasMany(db.ProductImg, { foreignKey: 'id_products', as: 'images' });
db.ProductImg.belongsTo(db.Product, { foreignKey: 'id_products' });

// ProductVariant -> ProductImg
db.ProductVariant.hasMany(db.ProductImg, { foreignKey: 'id_variant', as: 'variantImages' });
db.ProductImg.belongsTo(db.ProductVariant, { foreignKey: 'id_variant' });

// AttributeValue -> ProductImg (ảnh theo giá trị thuộc tính)
db.AttributeValue.hasMany(db.ProductImg, { foreignKey: 'id_value' });
db.ProductImg.belongsTo(db.AttributeValue, { foreignKey: 'id_value' });

db.ProductAttribute.belongsTo(db.Attribute, {
  foreignKey: 'id_attribute',
  as: 'attribute'
});

module.exports = db;
