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
    // Lấy dữ liệu từ body
    const {
      products_name,
      category_id,
      products_market_price,
      products_sale_price,
      products_description,
      specs,
      main_image_index,
      attributes,
      variants,
    } = req.body;

    // Validate bắt buộc và kiểu dữ liệu
    if (!products_name || typeof products_name !== 'string' || !products_name.trim()) {
      return res.status(400).json({ message: "Tên sản phẩm là bắt buộc và phải là chuỗi" });
    }

    if (!category_id || isNaN(parseInt(category_id))) {
      return res.status(400).json({ message: "Danh mục sản phẩm là bắt buộc và phải là số" });
    }

    const marketPrice = parseFloat(products_market_price) || 0;
    const salePrice = parseFloat(products_sale_price) || 0;

    if (marketPrice < 0 || salePrice < 0) {
      return res.status(400).json({ message: "Giá sản phẩm không được âm" });
    }

    // Parse các trường JSON
    const specsParsed = parseJSONSafe(specs);
    const attributesParsed = parseJSONSafe(attributes);
    const variantsParsed = parseJSONSafe(variants);

    if (!Array.isArray(specsParsed)) {
      return res.status(400).json({ message: "Thông số kỹ thuật không hợp lệ" });
    }

    if (!Array.isArray(attributesParsed)) {
      return res.status(400).json({ message: "Thuộc tính sản phẩm không hợp lệ" });
    }

    if (!Array.isArray(variantsParsed)) {
      return res.status(400).json({ message: "Biến thể sản phẩm không hợp lệ" });
    }

    // 1. Tạo sản phẩm mới
    const newProduct = await Product.create({
      products_name: products_name.trim(),
      category_id: parseInt(category_id),
      products_market_price: marketPrice,
      products_sale_price: salePrice,
      products_description: products_description || '',
      products_status: 1, // chờ duyệt
      products_primary: false,
    }, { transaction: t });

    // 2. Xử lý ảnh chung
    const uploadedImages = req.files?.images || [];
    const mainImgIndex = parseInt(main_image_index);
    const isValidMainImgIndex = !isNaN(mainImgIndex) && mainImgIndex >= 0 && mainImgIndex < uploadedImages.length;

    if (uploadedImages.length > 0) {
      const imageData = uploadedImages.map((file, index) => ({
        id_products: newProduct.id_products,
        Img_url: `/uploads/${file.filename}`,
        is_main: isValidMainImgIndex && mainImgIndex === index,
      }));

      await ProductImg.bulkCreate(imageData, { transaction: t });
    }

    // 3. Xử lý specs
    for (const { name, value } of specsParsed) {
      if (typeof name === 'string' && name.trim() && typeof value === 'string' && value.trim()) {
        await ProductSpec.create({
          id_products: newProduct.id_products,
          spec_name: name.trim(),
          spec_value: value.trim(),
        }, { transaction: t });
      }
    }

    // 4. Xử lý attributes và values
    const attributeValueMap = {}; // { optionName: { valueName: id_value } }

    for (const attr of attributesParsed) {
      if (!attr.name || typeof attr.name !== 'string' || !attr.values || !Array.isArray(attr.values)) {
        console.warn(`⚠️ Bỏ qua attribute không hợp lệ: ${JSON.stringify(attr)}`);
        continue;
      }

      const [attribute] = await Attribute.findOrCreate({
        where: { name: attr.name.trim() },
        defaults: { name: attr.name.trim() },
        transaction: t,
      });

      await ProductAttribute.create({
        id_product: newProduct.id_products,
        id_attribute: attribute.id_attribute,
      }, { transaction: t });

      attributeValueMap[attr.name.trim()] = attributeValueMap[attr.name.trim()] || {};

      for (const val of attr.values) {
        if (typeof val !== 'string' || !val.trim()) {
          console.warn(`⚠️ Bỏ qua giá trị attribute không hợp lệ: ${val}`);
          continue;
        }
        const [attributeValue] = await AttributeValue.findOrCreate({
          where: {
            id_attribute: attribute.id_attribute,
            value: val.trim(),
          },
          defaults: {
            id_attribute: attribute.id_attribute,
            value: val.trim(),
          },
          transaction: t,
        });

        attributeValueMap[attr.name.trim()][val.trim()] = attributeValue.id_value;
      }
    }

    // 5. Xử lý variants
    // Lưu ý: bạn có thể cấu hình tên thuộc tính chính (ví dụ: "Màu sắc") từ FE hoặc config
    const mainAttrName = "Màu sắc";

    for (const v of variantsParsed) {
      if (!v.sku || !v.price || !v.values || typeof v.values !== 'object') {
        console.warn(`⚠️ Bỏ qua variant không hợp lệ: ${JSON.stringify(v)}`);
        continue;
      }

      const quantity = parseInt(v.quantity) || 0;
      const variantImgIndex = parseInt(v.main_image_index);
      const isValidVariantImgIndex = !isNaN(variantImgIndex) && variantImgIndex >= 0 && variantImgIndex < uploadedImages.length;

      const variant = await ProductVariant.create({
        id_products: newProduct.id_products,
        sku: v.sku.trim(),
        price: parseFloat(v.price),
        quantity,
        status: quantity > 0,
      }, { transaction: t });

      // Tạo variant_values liên kết
      for (const [attrName, attrValue] of Object.entries(v.values)) {
        const attrNameTrim = attrName.trim();
        const attrValueTrim = attrValue.trim();

        const id_value = attributeValueMap[attrNameTrim]?.[attrValueTrim];
        if (!id_value) {
          throw new Error(`Không tìm thấy id_value cho: ${attrNameTrim} = ${attrValueTrim}`);
        }

        await VariantValue.create({
          id_variant: variant.id_variant,
          id_value,
        }, { transaction: t });
      }

      // Gán ảnh variant nếu có
      const variantImage = isValidVariantImgIndex ? uploadedImages[variantImgIndex] : null;
      const mainAttrValue = v.values[mainAttrName];
      const mainValueId = mainAttrValue ? attributeValueMap[mainAttrName]?.[mainAttrValue.trim()] : null;

      if (variantImage && mainValueId) {
        await ProductImg.create({
          id_products: newProduct.id_products,
          id_variant: variant.id_variant,
          id_value: mainValueId,
          Img_url: `/uploads/${variantImage.filename}`,
          is_main: true,
        }, { transaction: t });
      }
    }

    await t.commit();

    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      product: newProduct,
    });

  } catch (error) {
    console.error("❌ createProducts error:", error);
    await t.rollback();
    res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo sản phẩm",
      error: error.message,
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

//get all products 
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductImg,
          as: 'images',
          where: { is_main: true },
          required: false,
        },
      ],
      
    });

    const formatted = products.map((p) => ({
      products_id: p.id_products,
      products_name: p.products_name,
      market_price: parseFloat(p.products_market_price),
      sale_price: parseFloat(p.products_sale_price),
      products_primary: p.products_primary,
      products_status: p.products_status,
      main_image_url: p.images?.[0]?.img_url || null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//primary products
exports.togglePrimary = async (req, res) => {
  const productId = req.params.id;
  const { products_primary } = req.body;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    product.products_primary = products_primary; // 1 = không ghim, 2 = ghim
    await product.save();

    res.json({ message: "Cập nhật trạng thái ghim thành công." });
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái ghim:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái ghim." });
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