const db = require('../models/index.model');
const path = require('path');
const fs = require('fs');
const { Op, Sequelize } = require('sequelize');
const { parseJSONSafe } = require('../helper/parseJson');
const generateSKU = require('../helper/generateSKU');

const {
  Product, 
  ProductImg, 
  ProductSpec, 
  ProductAttribute,
  ProductVariant, 
  VariantValue, 
  AttributeValue, 
  Attribute,
  ProductAttributeValue, 
  Category
  
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
    const {
      id_products,
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

    if (!id_products) return res.status(400).json({ message: "ID sản phẩm là bắt buộc" });
    if (!products_name?.trim()) return res.status(400).json({ message: "Tên sản phẩm là bắt buộc" });
    if (!category_id || isNaN(parseInt(category_id))) return res.status(400).json({ message: "Danh mục không hợp lệ" });

    const marketPrice = parseFloat(products_market_price) || 0;
    const salePrice = parseFloat(products_sale_price) || 0;
    if (marketPrice < 0 || salePrice < 0) return res.status(400).json({ message: "Giá không được âm" });

    const specsParsed = parseJSONSafe(specs, []);
    const attributesParsed = parseJSONSafe(attributes, []);
    const variantsParsed = parseJSONSafe(variants, []);

    // Tìm sản phẩm cần update
    const product = await Product.findByPk(id_products, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Cập nhật bảng products
    await product.update({
      products_name: products_name.trim(),
      category_id: parseInt(category_id),
      products_market_price: marketPrice,
      products_sale_price: salePrice,
      products_description: products_description || '',
    }, { transaction: t });

    // Xử lý ảnh
    const uploadedImages = req.files?.images || [];
    const mainImgIndex = parseInt(main_image_index);
    const isValidMainImgIndex = !isNaN(mainImgIndex) && mainImgIndex >= 0 && mainImgIndex < uploadedImages.length;

    // Xóa hết ảnh hiện tại nếu muốn hoặc có thể nâng cấp xử lý ảnh theo yêu cầu bạn
    await ProductImg.destroy({ where: { id_products: id_products }, transaction: t });

    if (uploadedImages.length > 0) {
      const imageData = uploadedImages.map((file, idx) => ({
        id_products,
        Img_url: `/uploads/${file.filename}`,
        is_main: isValidMainImgIndex && idx === mainImgIndex,
      }));
      await ProductImg.bulkCreate(imageData, { transaction: t });
    }

    // Xóa specs cũ rồi thêm mới
    await ProductSpec.destroy({ where: { id_products }, transaction: t });
    for (const spec of specsParsed) {
      if (spec.name?.trim() && spec.value?.trim()) {
        await ProductSpec.create({
          id_products,
          spec_name: spec.name.trim(),
          spec_value: spec.value.trim(),
        }, { transaction: t });
      }
    }

    // Xóa attribute + attribute_value liên quan rồi tạo mới (hoặc bạn có thể cập nhật phức tạp hơn)
    await ProductAttribute.destroy({ where: { id_product: id_products }, transaction: t });
    // Cũng xóa variant_value + variant + thêm mới ở phần dưới

    const attributeValueMap = {};
    for (const attr of attributesParsed) {
      if (!attr.name || !Array.isArray(attr.values)) continue;

      const [attribute] = await Attribute.findOrCreate({
        where: { name: attr.name.trim() },
        defaults: { name: attr.name.trim() },
        transaction: t,
      });

      await ProductAttribute.create({
        id_product: id_products,
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

    // Xóa variants cũ + variant_values cũ
    const oldVariants = await ProductVariant.findAll({ where: { id_products: id_products }, transaction: t });
    for (const oldVariant of oldVariants) {
      await VariantValue.destroy({ where: { id_variant: oldVariant.id_variant }, transaction: t });
    }
    await ProductVariant.destroy({ where: { id_products: id_products }, transaction: t });

    // Lưu variants mới
    await saveVariants(variantsParsed, product, uploadedImages, attributeValueMap, t);

    await t.commit();
    res.status(200).json({ message: "Cập nhật sản phẩm thành công", product });

  } catch (err) {
    console.error("❌ Lỗi cập nhật sản phẩm:", err);
    await t.rollback();
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm", error: err.message });
  }
};

//getProductByid
exports.getProductsById = async (req, res) => {
  const id = req.params.id;

  try {
    // 1. Thông tin sản phẩm chính
    const product = await Product.findOne({
      where: { id_products: id },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'name', 'parent_id'],
          include: [
            {
              model: Category,
              as: 'parent',
              attributes: ['category_id', 'name'],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    console.log('Product with category:', JSON.stringify(product.toJSON(), null, 2)); // Debug

    // 2. Ảnh sản phẩm
    const images = await ProductImg.findAll({
      where: { id_products: id },
    });

    // 3. Thông số kỹ thuật
    const specs = await ProductSpec.findAll({
      where: { id_products: id },
    });

    // 4. Lấy attribute kèm giá trị thuộc sản phẩm chính xác
    const productAttributes = await ProductAttribute.findAll({
      where: { id_product: id },
      include: [
        {
          model: Attribute,
          as: 'attribute',
          include: [
            {
              model: AttributeValue,
              as: 'values',
              required: false,
              include: [
                {
                  model: ProductAttributeValue,
                  as: 'productAttributeValues',
                  where: { id_product: id },
                  required: true,
                },
                {
                  model: ProductImg,
                  as: 'images',
                },
              ],
            },
          ],
        },
      ],
    });

    const attributes = productAttributes.map(pa => ({
      attribute_id: pa.id_attribute,
      attribute_name: pa.attribute?.attribute_name,
      type: pa.attribute?.type || 'text',
      values: pa.attribute?.values?.map(v => ({
        value_id: v.id_value,
        value: v.value,
        extra_price: v.extra_price,
        quantity: v.quantity,
        status: v.status,
        is_main: v.is_main,
        color_code: v.color_code || null,
        images: v.images || [],
      })) || [],
    }));

    // 5. Lấy SKU + option combo + ảnh SKU nếu có
    const variantsRaw = await ProductVariant.findAll({
      where: { id_products: id },
      include: [
        {
          model: VariantValue,
          as: 'variantValues',
          include: [
            {
              model: AttributeValue,
              as: 'attributeValue',
              include: [
                {
                  model: Attribute,
                  as: 'attribute',
                },
              ],
            },
          ],
        },
        {
          model: ProductImg,
          as: 'images',
        },
      ],
    });

    const skus = variantsRaw.map(variant => ({
      variant_id: variant.id_product_variant,
      sku_code: variant.sku_code,
      quantity: variant.quantity,
      price: variant.price,
      status: variant.status,
      images: variant.images || [],
      option_combo: variant.variantValues.map(v => ({
        attribute: v.attributeValue?.attribute?.attribute_name,
        value: v.attributeValue?.value,
      })),
    }));

    // Format response để khớp với frontend
    const response = {
      product: {
        id_products: product.id_products,
        products_name: product.products_name,
        products_market_price: product.products_market_price,
        products_sale_price: product.products_sale_price,
        products_description: product.products_description,
        products_status: product.products_status,
        products_primary: product.products_primary,
      },
      category: product.category || null,
      images,
      specs,
      attributes,
      skus,
    };

    console.log('Final response:', JSON.stringify(response, null, 2)); // Debug
    return res.json(response);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo ID:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message || error,
    });
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