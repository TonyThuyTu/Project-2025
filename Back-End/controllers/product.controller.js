const db = require('../models/index.model');
const path = require('path');
const fs = require('fs');
const { Op, Sequelize } = require('sequelize');
const { parseJSONSafe } = require('../helper/parseJson');
const generateSKU = require('../helper/generateSKU');

const {
  Product, ProductImg, ProductSpec, ProductAttribute,
  ProductVariant, VariantValue, AttributeValue, Attribute,
} = db;

exports.createProducts = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    console.log("🔔 Bắt đầu tạo sản phẩm với dữ liệu:", req.body);

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

    // Validate cơ bản
    if (!products_name?.trim()) {
      console.warn("⚠️ Tên sản phẩm trống");
      return res.status(400).json({ message: "Tên sản phẩm là bắt buộc" });
    }
    if (!category_id || isNaN(parseInt(category_id))) {
      console.warn("⚠️ Category ID không hợp lệ:", category_id);
      return res.status(400).json({ message: "Danh mục không hợp lệ" });
    }

    const marketPrice = parseFloat(products_market_price) || 0;
    const salePrice = parseFloat(products_sale_price) || 0;
    if (marketPrice < 0 || salePrice < 0) {
      console.warn("⚠️ Giá thị trường hoặc giá bán âm", marketPrice, salePrice);
      return res.status(400).json({ message: "Giá không được âm" });
    }

    const specsParsed = parseJSONSafe(specs, []);
    const attributesParsed = parseJSONSafe(attributes, []);
    const variantsParsed = parseJSONSafe(variants, []);

    if (!Array.isArray(specsParsed)) {
      console.warn("⚠️ Specs không phải array:", specsParsed);
      return res.status(400).json({ message: "Thông số kỹ thuật không hợp lệ" });
    }
    if (!Array.isArray(attributesParsed)) {
      console.warn("⚠️ Attributes không phải array:", attributesParsed);
      return res.status(400).json({ message: "Thuộc tính sản phẩm không hợp lệ" });
    }
    if (!Array.isArray(variantsParsed)) {
      console.warn("⚠️ Variants không phải array:", variantsParsed);
      return res.status(400).json({ message: "Biến thể sản phẩm không hợp lệ" });
    }

    // Tạo sản phẩm chính
    const newProduct = await Product.create({
      products_name: products_name.trim(),
      category_id: parseInt(category_id),
      products_market_price: marketPrice,
      products_sale_price: salePrice,
      products_description: products_description || '',
      products_status: 1,
      products_primary: false,
    }, { transaction: t });

    console.log("✅ Tạo sản phẩm thành công với id:", newProduct.id_products);

    // Xử lý ảnh upload
    const uploadedImages = req.files?.images || [];
    const mainImgIndex = parseInt(main_image_index);
    const isValidMainImgIndex = !isNaN(mainImgIndex) && mainImgIndex >= 0 && mainImgIndex < uploadedImages.length;

    if (uploadedImages.length > 0) {
      const imageData = uploadedImages.map((file, idx) => ({
        id_products: newProduct.id_products,
        Img_url: `/uploads/${file.filename}`,
        is_main: isValidMainImgIndex && idx === mainImgIndex,
      }));
      await ProductImg.bulkCreate(imageData, { transaction: t });
      console.log(`✅ Đã lưu ${imageData.length} ảnh sản phẩm.`);
    } else {
      console.log("ℹ️ Không có ảnh sản phẩm upload.");
    }

    // Thêm specs
    for (const spec of specsParsed) {
      if (spec.name?.trim() && spec.value?.trim()) {
        await ProductSpec.create({
          id_products: newProduct.id_products,
          spec_name: spec.name.trim(),
          spec_value: spec.value.trim(),
        }, { transaction: t });
      }
    }
    console.log(`✅ Đã lưu ${specsParsed.length} specs.`);

    // Map attribute + value
    const attributeValueMap = {};
    for (const attr of attributesParsed) {
      if (!attr.name || !Array.isArray(attr.values)) {
        console.warn("⚠️ Thuộc tính không hợp lệ, bỏ qua:", attr);
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

      attributeValueMap[attr.name.trim()] = {};

      for (const val of attr.values) {
        const label = typeof val === 'string' ? val : val?.label;
        if (!label?.trim()) continue;

        const [attributeValue] = await AttributeValue.findOrCreate({
          where: {
            id_attribute: attribute.id_attribute,
            value: label.trim(),
          },
          defaults: {
            id_attribute: attribute.id_attribute,
            value: label.trim(),
          },
          transaction: t,
        });

        attributeValueMap[attr.name.trim()][label.trim()] = attributeValue.id_value;
      }
    }
    console.log("✅ Map attributeValueMap:", attributeValueMap);

    // Gọi hàm lưu variants
    console.log("🔔 Bắt đầu lưu variants:", variantsParsed.length);
    await saveVariants(variantsParsed, newProduct, uploadedImages, attributeValueMap, t);

    await t.commit();
    console.log("🎉 Tạo sản phẩm hoàn tất, commit transaction.");

    res.status(201).json({ message: "Tạo sản phẩm thành công", product: newProduct });

  } catch (err) {
    console.error("❌ Lỗi tạo sản phẩm:", err);
    await t.rollback();
    res.status(500).json({ message: "Lỗi khi tạo sản phẩm", error: err.message });
  }
};

// Hàm xử lý biến thể, thêm log chi tiết
async function saveVariants(variantsParsed, newProduct, uploadedImages, attributeValueMap, transaction) {
  console.log("🔔 saveVariants bắt đầu với", variantsParsed.length, "variants");
  const mainAttrName = Object.keys(attributeValueMap)[0];
  console.log("▶️ Thuộc tính chính (mainAttrName):", mainAttrName);

  for (const v of variantsParsed) {
    // Chuyển combo thành values object
    const values = {};
    if (Array.isArray(v.combo)) {
      for (const item of v.combo) {
        if (item.optionName && item.value) {
          values[item.optionName] = item.value;
        }
      }
    }

    if (!v.price || typeof values !== "object" || Object.keys(values).length === 0) {
      console.warn("⚠️ Variant thiếu price hoặc values:", v);
      continue;
    }

    console.log("⏳ Xử lý variant:", v);

    const quantity = parseInt(v.quantity) || 0;
    const status = quantity > 0 ? 2 : 1;

    const variantImgIndex = parseInt(v.main_image_index);
    const isValidVariantImgIndex =
      !isNaN(variantImgIndex) &&
      variantImgIndex >= 0 &&
      variantImgIndex < uploadedImages.length;

    const autoSKU = generateSKU(newProduct.products_name, values);
    const finalSKU = v.sku?.trim() || autoSKU;

    const variant = await ProductVariant.create({
      id_products: newProduct.id_products,
      sku: finalSKU,
      price: parseFloat(v.price),
      quantity,
      status,
    }, { transaction });

    for (const [attrName, attrValue] of Object.entries(values)) {
      const id_value = attributeValueMap[attrName?.trim()]?.[attrValue?.trim()];
      if (!id_value) {
        console.warn(`❌ Không tìm thấy id_value cho ${attrName} = ${attrValue}`);
        throw new Error(`Thiếu giá trị thuộc tính: ${attrName} = ${attrValue}`);
      }

      await VariantValue.create({
        id_variant: variant.id_variant,
        id_value,
      }, { transaction });
    }

    const variantImage = isValidVariantImgIndex ? uploadedImages[variantImgIndex] : null;
    const mainAttrValue = values[mainAttrName];
    const mainValueId = mainAttrValue
      ? attributeValueMap[mainAttrName]?.[mainAttrValue.trim()]
      : null;

    if (variantImage && mainValueId) {
      await ProductImg.create({
        id_products: newProduct.id_products,
        id_variant: variant.id_variant,
        id_value: mainValueId,
        Img_url: `/uploads/${variantImage.filename}`,
        is_main: true,
      }, { transaction });
    }
  }

  console.log("✅ Hoàn thành lưu variants.");
}

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