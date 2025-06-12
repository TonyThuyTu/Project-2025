const db = require('../models/index.model');
const path = require('path');
const fs = require('fs');
const { Op, Sequelize } = require('sequelize');

const {
  Product,

  ProductImg,

  ProductSpec,

  ProductAttribute,

  ProductVariant,

  VariantValue,

  AttributeValue,

  Attribute,

} = db;

//add product
exports.createProducts = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    console.log('req.body.attributes =', req.body.attributes);
    console.log('Type of attributes:', typeof req.body.attributes);
    const {
      products_name,
      category_id,
      products_market_price,
      products_sale_price,
      products_description,
      specs,
      main_image_index,
      options,
      variants,
    } = req.body;

    if (!products_name || !category_id) {
      return res.status(400).json({ message: "Tên sản phẩm và danh mục là bắt buộc" });
    }
      
    // 1. Tạo sản phẩm
    const newProduct = await Product.create({
      products_name,
      category_id,
      products_market_price,
      products_sale_price,
      products_description,
      products_status: 1,
      products_primary: false,
    }, { transaction: t });

    // 2. Upload ảnh sản phẩm chung
    const uploadedImages = req.files?.images || [];
    const imagesData = uploadedImages.map((file, index) => ({
      id_products: newProduct.id_products,
      Img_url: `/uploads/${file.filename}`,
      is_main: parseInt(main_image_index) === index,
    }));
    await ProductImg.bulkCreate(imagesData, { transaction: t });

    // 3. Specs
    if (specs) {
      const parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;

      for (const spec of parsedSpecs) {
        const { key, value } = spec;
        if (key && value) {
          await ProductSpec.create({
            id_products: newProduct.id_products,
            spec_name: key,
            spec_value: value,
          }, { transaction: t });
        }
      }
    }


    // ---------- OPTIONS ----------
    
    let parsedOptions;
    if (typeof req.body.attributes === 'string') {
      parsedOptions = JSON.parse(req.body.attributes);
    } else if (Array.isArray(req.body.attributes)) {
      parsedOptions = req.body.attributes;
    } else {
      return res.status(400).json({
        message: "Trường attributes phải là chuỗi JSON hoặc mảng"
      });
    }

    let attributeValueMap = {}; // ✅ Khởi tạo map ánh xạ

    for (const opt of parsedOptions) {

      console.log('Processing attribute name:', opt.name);
      if (!opt.name) {
        throw new Error('Attribute name bị thiếu trong options');
      }

      const [attribute] = await Attribute.findOrCreate({
        where: { name: opt.name },
        defaults: { name: opt.name },
        transaction: t,
      });

  
      await ProductAttribute.create({
        id_product: newProduct.id_products,
        id_attribute: attribute.id_attribute,
      }, { transaction: t });

      // ✅ Tạo các giá trị (AttributeValue)
      for (const value of opt.values) {
        const [attributeValue] = await AttributeValue.findOrCreate({
          where: {
            id_attribute: attribute.id_attribute,
            value,
          },
          defaults: {
            id_attribute: attribute.id_attribute,
            value,
          },
          transaction: t,
        });

        // ✅ Lưu vào map để dùng cho variants
        if (!attributeValueMap[opt.name]) {
          attributeValueMap[opt.name] = {};
        }
        attributeValueMap[opt.name][value] = attributeValue.id_value;
      }
    }

    // ---------- VARIANTS ----------
    if (variants) {
      const parsedVariants = JSON.parse(variants);

      for (const v of parsedVariants) {
        const { sku, price, values, main_image_index: variantIndex } = v;
        const quantity = v.quantity ?? 0; // ✅ Gán mặc định nếu thiếu
        const variant = await ProductVariant.create({
          id_products: newProduct.id_products,
          sku,
          price,
          quantity:v.quantity || 0,
          status: quantity > 0,
        }, { transaction: t });

        let valueIds = [];

        for (const [attrName, attrValue] of Object.entries(values)) {
          const id_value = attributeValueMap[attrName]?.[attrValue];

          if (!id_value) {
            throw new Error(`Không tìm thấy ID cho thuộc tính: ${attrName} - ${attrValue}`);
          }

          await VariantValue.create({
            id_variant: variant.id_variant,
            id_value,
          }, { transaction: t });

          valueIds.push(id_value);
        }

        // Gán ảnh chính cho variant nếu có
        const mainValueId = valueIds[variantIndex];
        const variantImage = uploadedImages[variantIndex];

        if (variantImage) {
          await ProductImg.create({
            id_products: newProduct.id_products,
            id_variant: variant.id_variant,
            id_value: mainValueId,
            Img_url: `/uploads/${variantImage.filename}`,
            is_main: true,
          }, { transaction: t });
        }
      }
    }
    await t.commit();
    res.status(201).json({
      message: 'Tạo sản phẩm nâng cao thành công',
      product: newProduct,
    });
  } catch (error) {
      console.error('❌ JSON.parse(attributes) lỗi:', error);
      return res.status(400).json({
      message: "Lỗi khi phân tích dữ liệu attributes, vui lòng kiểm tra JSON",
      error: error.message
    });
  }
};

//update products
exports.updateProduct = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const productId = req.params.id;

    const {
      products_name,
      category_id,
      products_market_price,
      products_sale_price,
      products_description,
      products_status,
      products_primary,
      specs,
      attributes,
      variants,
      main_image_index,
    } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    await product.update({
      products_name,
      category_id,
      products_market_price,
      products_sale_price,
      products_description,
      products_primary,
      products_status,
    }, { transaction: t });

    // Specs
    if (specs) {
      const parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
      await ProductSpec.destroy({ where: { id_products: productId }, transaction: t });

      for (const { key, value } of parsedSpecs) {
        if (key && value) {
          await ProductSpec.create({
            id_products: productId,
            spec_name: key,
            spec_value: value,
          }, { transaction: t });
        }
      }
    }

    // Xoá attributes và variants cũ
    await VariantValue.destroy({
      where: {
        id_variant: {
          [Op.in]: Sequelize.literal(`(SELECT id_variant FROM product_variants WHERE id_products = ${productId})`)
        }
      },
      transaction: t
    });
    await ProductVariant.destroy({ where: { id_products: productId }, transaction: t });
    await ProductAttribute.destroy({ where: { id_product: productId }, transaction: t });

    // Xử lý attributes
    let parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    let attributeValueMap = {};

    for (const attr of parsedAttributes) {
      const [attribute] = await Attribute.findOrCreate({ where: { name: attr.name }, defaults: { name: attr.name } });
      await ProductAttribute.create({ id_product: productId, id_attribute: attribute.id_attribute }, { transaction: t });

      for (const value of attr.values) {
        const [attrValue] = await AttributeValue.findOrCreate({
          where: { id_attribute: attribute.id_attribute, value },
          defaults: { id_attribute: attribute.id_attribute, value },
        });

        if (!attributeValueMap[attr.name]) attributeValueMap[attr.name] = {};
        attributeValueMap[attr.name][value] = attrValue.id_value;
      }
    }

    // Variants
    if (variants) {
      const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;

      for (const variant of parsedVariants) {
        const newVariant = await ProductVariant.create({
          id_products: productId,
          sku: variant.sku,
          price: variant.price,
          quantity: variant.quantity,
          status: variant.quantity > 0,
        }, { transaction: t });

        for (const [name, val] of Object.entries(variant.values)) {
          const id_value = attributeValueMap[name]?.[val];
          if (!id_value) throw new Error(`Không tìm thấy id_value cho ${name} - ${val}`);

          await VariantValue.create({
            id_variant: newVariant.id_variant,
            id_value,
          }, { transaction: t });
        }
      }
    }

    // Xoá ảnh cũ (nếu cần)
    await ProductImg.destroy({ where: { id_products: productId }, transaction: t });

    // Xử lý ảnh gửi lên
    if (req.files && req.files.images) {
      const variantImagesMap = {};
      for (const file of req.files.images) {
        const [attributeName, valueWithExt] = file.originalname.split('__');
        const valueName = valueWithExt?.split('.')[0];

        if (!attributeName || !valueName) continue;

        if (!variantImagesMap[attributeName]) variantImagesMap[attributeName] = {};
        if (!variantImagesMap[attributeName][valueName]) variantImagesMap[attributeName][valueName] = [];
        variantImagesMap[attributeName][valueName].push(file);
      }

      for (const attrName in variantImagesMap) {
        for (const valName in variantImagesMap[attrName]) {
          const files = variantImagesMap[attrName][valName];

          const attr = await Attribute.findOne({ where: { name: attrName } });
          const attrVal = await AttributeValue.findOne({
            where: {
              id_attribute: attr?.id_attribute,
              value: valName,
            },
          });

          if (!attrVal) continue;

          const variantValue = await VariantValue.findOne({
            where: { id_value: attrVal.id_value },
          });

          if (!variantValue) continue;

          for (let i = 0; i < files.length; i++) {
            const is_main = main_image_index
              ? JSON.parse(main_image_index)?.[attrName]?.[valName] === i
              : false;

            await ProductImg.create({
              id_products: productId,
              id_variant_value: variantValue.id_variant_value,
              image_url: `/uploads/${files[i].filename}`,
              is_main,
            }, { transaction: t });
          }
        }
      }
    }

    await t.commit();
    return res.json({ message: 'Cập nhật sản phẩm thành công' });

  } catch (error) {
    await t.rollback();
    console.error('Lỗi cập nhật sản phẩm:', error);
    return res.status(500).json({ message: 'Cập nhật sản phẩm thất bại', error: error.message });
  }
};

// delete products
exports.deleteProduct = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    // Kiểm tra tồn tại sản phẩm
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Lấy danh sách ảnh để xóa file vật lý
    const images = await ProductImg.findAll({
      where: { id_products: id }
    });

    // Xóa file ảnh vật lý
    for (const img of images) {
      const filePath = path.join(__dirname, '..', img.Img_url); // ví dụ: /uploads/products/...
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Xóa ảnh trong DB
    await ProductImg.destroy({
      where: { id_products: id },
      transaction: t,
    });

    // Xóa thông số kỹ thuật
    await ProductSpec.destroy({
      where: { id_products: id },
      transaction: t,
    });

    // Xóa sản phẩm
    await Product.destroy({
      where: { id_products: id },
      transaction: t,
    });

    await t.commit();
    res.status(200).json({ message: 'Đã xóa sản phẩm và toàn bộ dữ liệu liên quan thành công' });
  } catch (error) {
    await t.rollback();
    console.error('Lỗi khi xóa sản phẩm:', error);
    res.status(500).json({
      message: 'Xóa sản phẩm thất bại',
      error: error.message,
    });
  }
};