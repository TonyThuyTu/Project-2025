const db = require('../models/index.model');
const path = require('path');
const fs = require('fs');

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

    const parsedOptions = JSON.parse(options);

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
    let attributeValueMap = {}; // ✅ Khởi tạo map ánh xạ

    for (const opt of parsedOptions) {
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
    await t.rollback();
    console.error('❌ Lỗi tạo sản phẩm nâng cao:', error);
    res.status(500).json({
      message: 'Tạo sản phẩm thất bại',
      error: error.message,
    });
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