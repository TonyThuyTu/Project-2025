const db = require('../models/index.model');
const Product = db.Product;
const Category = db.Category;
const ProductSpec = db.ProductSpec;
const Attribute = db.Attribute;
const AttributeValue = db.AttributeValue;
const ProductAttribute = db.ProductAttribute;
const ProductVariant = db.ProductVariant;
const VariantValue = db.VariantValue;
const ProductImg = db.ProductImg;

//thêm sản phẩm
exports.createProduct = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    let {
      product_variants,
      product_specs,
      specs,
      attributes,
      variants,
      images,
      category_id,
      products_name,
      products_market_price,
      products_sale_price,
      products_description,
      ...rest
    } = req.body;

    // Parse JSON nếu dữ liệu là string
    if (typeof product_variants === 'string') product_variants = JSON.parse(product_variants);
    if (typeof product_specs === 'string') product_specs = JSON.parse(product_specs);
    if (typeof specs === 'string') specs = JSON.parse(specs);
    if (typeof variants === 'string') variants = JSON.parse(variants);
    if (typeof attributes === 'string') attributes = JSON.parse(attributes);
    if (typeof images === 'string') images = JSON.parse(images);

    // 1. Check category tồn tại
    const catId = Number(category_id);
    if (isNaN(catId)) {
      await t.rollback();
      return res.status(400).json({ message: 'category_id không hợp lệ' });
    }

    const category = await Category.findByPk(catId);
    if (!category) {
      await t.rollback();
      return res.status(400).json({ message: 'Category không tồn tại' });
    }

    // 2. Tạo sản phẩm mới với trạng thái mặc định ẩn và không ghim
    const newProduct = await Product.create({
      category_id,
      products_name,
      products_market_price,
      products_sale_price,
      products_description,
      products_status: false,
      products_primary: false,
    }, { transaction: t });

    const productId = newProduct.id_products;

    // 3. Thêm specs (nếu có)
    if (Array.isArray(specs) && specs.length > 0) {
      for (const spec of specs) {
        await ProductSpec.create({
          id_products: productId,
          spec_name: spec.spec_name,
          spec_value: spec.spec_value
        }, { transaction: t });
      }
    }

    // 4. Liên kết thuộc tính với sản phẩm (nếu có)
    if (Array.isArray(attributes) && attributes.length > 0) {
      for (const attr of attributes) {
        await ProductAttribute.create({
          id_product: productId,
          id_attribute: attr.id_attribute
        }, { transaction: t });
      }
    }

    // 5. Thêm biến thể sản phẩm (nếu có)
    if (Array.isArray(variants) && variants.length > 0) {
      for (const variant of variants) {
        const newVariant = await ProductVariant.create({
          id_products: productId,
          sku: variant.sku,
          price: variant.price,
          quantity: variant.quantity,
          status: variant.status,
        }, { transaction: t });

        if (Array.isArray(variant.attribute_value_ids) && variant.attribute_value_ids.length > 0) {
          for (const id_value of variant.attribute_value_ids) {
            await VariantValue.create({
              id_variant: newVariant.id_variant,
              id_value: id_value
            }, { transaction: t });
          }
        }

        if (Array.isArray(variant.attribute_values) && variant.attribute_values.length > 0) {
          for (const av of variant.attribute_values) {
            let attributeValue = await AttributeValue.findOne({
              where: {
                id_attribute: av.id_attribute,
                value: av.value
              }
            });

            if (!attributeValue) {
              attributeValue = await AttributeValue.create({
                id_attribute: av.id_attribute,
                value: av.value,
                extra_price: av.extra_price || 0,
                status: true
              }, { transaction: t });
            }

            await VariantValue.create({
              id_variant: newVariant.id_variant,
              id_value: attributeValue.id_value
            }, { transaction: t });
          }
        }
      }
    }

    // 6. Thêm ảnh sản phẩm (nếu có)
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        await ProductImg.create({
          id_products: productId,
          id_variant: img.id_variant || null,
          id_value: img.id_value || null,
          Img_url: img.img_url,
          is_main: img.is_main || false
        }, { transaction: t });
      }
    }

    await t.commit();

    return res.status(201).json({
      message: 'Tạo sản phẩm thành công, chờ admin duyệt',
      product: newProduct
    });

  } catch (error) {
    await t.rollback();
    console.error('🔴 ERROR ở createProduct:', error);
    return res.status(500).json({ message: 'Tạo sản phẩm thất bại', error: error.message });
  }
};


// lấy tất cả danh sách sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: 'category', attributes: ['category_id', 'name'] },
        { model: ProductImg, as: 'images', attributes: ['img_url', 'is_main', 'id_variant', 'id_value'] },
        { model: ProductSpec, as: 'specs', attributes: ['spec_name', 'spec_value'] },
        {
          model: ProductAttribute,
          as: 'productAttributes',
          include: [
            {
              model: Attribute,
              as: 'attribute',
              attributes: ['name'],
              include: [
                {
                  model: AttributeValue,
                  as: 'values',
                  attributes: ['value', 'extra_price', 'status']
                }
              ]
            }
          ]
        },
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['sku', 'price', 'quantity', 'status'],
          include: [
            { model: VariantValue, as: 'variantValues', attributes: ['id_value'] }
          ]
        }
      ]
    });
    console.log(JSON.stringify(products, null, 2));
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
