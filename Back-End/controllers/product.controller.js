const db = require('../models/index.model');
const path = require('path');
const { Op } = require("sequelize");
const fs = require('fs');
const { sequelize } = db;
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
  Category, 
} = db;

//lấy danh sách danh mục và sản phẩm được ghim


//lấy sản phẩm tưng tự
exports.getSameProducts = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findOne({
      where: { id_products: id },
      include: [
        {
          model: ProductImg,
          as: "images",
          attributes: ["img_url", "is_main"],
        },
        {
          model: ProductSpec,
          as: "specs",
        },
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name", "parent_id"],
          include: [
            {
              model: Category,
              as: "parent",
              attributes: ["category_id", "name"],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ product });
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

//create product
exports.createProducts = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      products_name,
      category_id,
      products_market_price,
      products_sale_price,
      products_description,
      specs,
      attributes,
      variants,
      commonImageIsMain,
      optionImageIsMain,
      optionImageValues,
    } = req.body;

    // Validate input
    if (!products_name?.trim()) return res.status(400).json({ message: "Tên sản phẩm là bắt buộc" });
    if (!category_id || isNaN(+category_id)) return res.status(400).json({ message: "Danh mục không hợp lệ" });

    const marketPrice = parseFloat(products_market_price) || 0;
    const salePrice = parseFloat(products_sale_price) || 0;
    if (marketPrice < 0 || salePrice < 0) return res.status(400).json({ message: "Giá không được âm" });

    const specsParsed = parseJSONSafe(specs, []);
    const attributesParsed = parseJSONSafe(attributes, []);
    const variantsParsed = parseJSONSafe(variants, []);

    const newProduct = await Product.create({
      products_name: products_name.trim(),
      category_id: +category_id,
      products_market_price: marketPrice,
      products_sale_price: salePrice,
      products_description: products_description || '',
      products_status: 1,
      products_primary: 1,
    }, { transaction: t });

    // ===== Attributes & Values =====
    const attributeValueMap = {};
    for (const attr of attributesParsed) {
      if (!attr.name || !Array.isArray(attr.values)) continue;

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

        await ProductAttributeValue.create({
          id_product: newProduct.id_products,
          id_value: attributeValue.id_value,
        }, { transaction: t });

        attributeValueMap[attr.name.trim()][label.trim()] = attributeValue.id_value;
      }
    }

    // ===== Images =====
    const getIdValueFromLabel = (label) => {
      for (const attr in attributeValueMap) {
        if (attributeValueMap[attr][label]) {
          return attributeValueMap[attr][label];
        }
      }
      return null;
    };

    const groupedImages = { common: [], byValue: {} };
    const commonImages = req.files?.commonImages || [];
    const optionImages = req.files?.optionImages || [];

    const commonFlags = Array.isArray(commonImageIsMain) ? commonImageIsMain : [commonImageIsMain];
    const optionFlags = Array.isArray(optionImageIsMain) ? optionImageIsMain : [optionImageIsMain];
    const optionLabels = Array.isArray(optionImageValues) ? optionImageValues : [optionImageValues];

    commonImages.forEach((file, i) => {
      groupedImages.common.push({
        id_products: newProduct.id_products,
        id_variant: null,
        id_value: null,
        Img_url: `/uploads/${file.filename}`,
        is_main: commonFlags[i] === 'true',
      });
    });

    optionImages.forEach((file, i) => {
      const label = optionLabels[i];
      const id_value = getIdValueFromLabel(label);
      if (!id_value) return;
      if (!groupedImages.byValue[id_value]) groupedImages.byValue[id_value] = [];
      groupedImages.byValue[id_value].push({
        id_products: newProduct.id_products,
        id_variant: null,
        id_value,
        Img_url: `/uploads/${file.filename}`,
        is_main: optionFlags[i] === 'true',
      });
    });

    const processMain = (images) => {
      let flagged = false;
      return images.map(img => {
        if (!flagged && img.is_main) {
          flagged = true;
          return img;
        }
        return { ...img, is_main: false };
      });
    };

    const finalImages = [
      ...processMain(groupedImages.common),
      ...Object.values(groupedImages.byValue).flatMap(processMain),
    ];

    await ProductImg.bulkCreate(finalImages, { transaction: t });

    // ===== Specs =====
    for (const spec of specsParsed) {
      if (spec.name?.trim() && spec.value?.trim()) {
        await ProductSpec.create({
          id_products: newProduct.id_products,
          spec_name: spec.name.trim(),
          spec_value: spec.value.trim(),
        }, { transaction: t });
      }
    }

    // ===== Variants =====
    await saveVariants(variantsParsed, newProduct, [...commonImages, ...optionImages], attributeValueMap, t);

    await t.commit();
    res.status(201).json({ message: 'Tạo sản phẩm thành công', product: newProduct });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: err.message });
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
      // Reset ảnh đại diện cũ của biến thể này
      await ProductImg.update(
        { is_main: false },
        {
          where: {
            id_products: newProduct.id_products,
            id_variant: variant.id_variant,
          },
          transaction,
        }
      );

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
// exports.updateProduct = async (req, res) => {
//   const t = await db.sequelize.transaction();
//   try {
//     const {
//       id_products,
//       products_name,
//       category_id,
//       products_market_price,
//       products_sale_price,
//       products_description,
//       specs,
//       main_image_index,
//       attributes,
//       variants,
//     } = req.body;

//     if (!id_products) return res.status(400).json({ message: "ID sản phẩm là bắt buộc" });
//     if (!products_name?.trim()) return res.status(400).json({ message: "Tên sản phẩm là bắt buộc" });
//     if (!category_id || isNaN(parseInt(category_id))) return res.status(400).json({ message: "Danh mục không hợp lệ" });

//     const marketPrice = parseFloat(products_market_price) || 0;
//     const salePrice = parseFloat(products_sale_price) || 0;
//     if (marketPrice < 0 || salePrice < 0) return res.status(400).json({ message: "Giá không được âm" });

//     const specsParsed = parseJSONSafe(specs, []);
//     const attributesParsed = parseJSONSafe(attributes, []);
//     const variantsParsed = parseJSONSafe(variants, []);

//     // Tìm sản phẩm cần update
//     const product = await Product.findByPk(id_products, { transaction: t });
//     if (!product) {
//       await t.rollback();
//       return res.status(404).json({ message: "Sản phẩm không tồn tại" });
//     }

//     // Cập nhật bảng products
//     await product.update({
//       products_name: products_name.trim(),
//       category_id: parseInt(category_id),
//       products_market_price: marketPrice,
//       products_sale_price: salePrice,
//       products_description: products_description || '',
//     }, { transaction: t });

//     // Xử lý ảnh
//     const uploadedImages = req.files?.images || [];
//     const mainImgIndex = parseInt(main_image_index);
//     const isValidMainImgIndex = !isNaN(mainImgIndex) && mainImgIndex >= 0 && mainImgIndex < uploadedImages.length;

//     // Xóa hết ảnh hiện tại nếu muốn hoặc có thể nâng cấp xử lý ảnh theo yêu cầu bạn
//     await ProductImg.destroy({ where: { id_products: id_products }, transaction: t });

//     if (uploadedImages.length > 0) {
//       const imageData = uploadedImages.map((file, idx) => ({
//         id_products,
//         Img_url: `/uploads/${file.filename}`,
//         is_main: isValidMainImgIndex && idx === mainImgIndex,
//       }));
//       await ProductImg.bulkCreate(imageData, { transaction: t });
//     }

//     // Xóa specs cũ rồi thêm mới
//     await ProductSpec.destroy({ where: { id_products }, transaction: t });
//     for (const spec of specsParsed) {
//       if (spec.name?.trim() && spec.value?.trim()) {
//         await ProductSpec.create({
//           id_products,
//           spec_name: spec.name.trim(),
//           spec_value: spec.value.trim(),
//         }, { transaction: t });
//       }
//     }

//     // Xóa attribute + attribute_value liên quan rồi tạo mới (hoặc bạn có thể cập nhật phức tạp hơn)
//     await ProductAttribute.destroy({ where: { id_product: id_products }, transaction: t });
//     // Cũng xóa variant_value + variant + thêm mới ở phần dưới

//     const attributeValueMap = {};
//     for (const attr of attributesParsed) {
//       if (!attr.name || !Array.isArray(attr.values)) continue;

//       const [attribute] = await Attribute.findOrCreate({
//         where: { name: attr.name.trim() },
//         defaults: { name: attr.name.trim() },
//         transaction: t,
//       });

//       await ProductAttribute.create({
//         id_product: id_products,
//         id_attribute: attribute.id_attribute,
//       }, { transaction: t });

//       attributeValueMap[attr.name.trim()] = {};

//       for (const val of attr.values) {
//         const label = typeof val === 'string' ? val : val?.label;
//         if (!label?.trim()) continue;

//         const [attributeValue] = await AttributeValue.findOrCreate({
//           where: {
//             id_attribute: attribute.id_attribute,
//             value: label.trim(),
//           },
//           defaults: {
//             id_attribute: attribute.id_attribute,
//             value: label.trim(),
//           },
//           transaction: t,
//         });

//         attributeValueMap[attr.name.trim()][label.trim()] = attributeValue.id_value;
//       }
//     }

//     // Xóa variants cũ + variant_values cũ
//     const oldVariants = await ProductVariant.findAll({ where: { id_products: id_products }, transaction: t });
//     for (const oldVariant of oldVariants) {
//       await VariantValue.destroy({ where: { id_variant: oldVariant.id_variant }, transaction: t });
//     }
//     await ProductVariant.destroy({ where: { id_products: id_products }, transaction: t });

//     // Lưu variants mới
//     await saveVariants(variantsParsed, product, uploadedImages, attributeValueMap, t);

//     await t.commit();
//     res.status(200).json({ message: "Cập nhật sản phẩm thành công", product });

//   } catch (err) {
//     console.error("❌ Lỗi cập nhật sản phẩm:", err);
//     await t.rollback();
//     res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm", error: err.message });
//   }
// };

//option (attibute)
    // if (attributes) {
    //   const attrs = typeof attributes === "string" ? JSON.parse(attributes) : attributes;

    //   for (const attr of attrs) {
    //     let attribute;

    //     // Tìm attribute cũ nếu có
    //     if (attr.id_attribute) {
    //       attribute = await Attribute.findOne({
    //         where: {
    //           id_attribute: attr.id_attribute, // ✅ sửa lại tên đúng
    //           product_id: id,
    //         },
    //         transaction: t,
    //       });

    //       if (attribute) {
    //         attribute.name = attr.name || attribute.name;
    //         attribute.type = attr.type || attribute.type;
    //         await attribute.save({ transaction: t });
    //       }
    //     }

    //     // Nếu không tồn tại thì tạo mới
    //     if (!attribute) {
    //       attribute = await Attribute.create({
    //         product_id: id,
    //         name: attr.name,
    //         type: attr.type,
    //       }, { transaction: t });
    //     }

    //     // --- Cập nhật giá trị (AttributeValue) ---
    //     if (attr.values && Array.isArray(attr.values)) {
    //       for (const val of attr.values) {
    //         let value;

    //         if (val.id_value) {
    //           value = await AttributeValue.findOne({
    //             where: {
    //               id_value: val.id_value, // ✅ sửa đúng cột
    //               id_attribute: attribute.id_attribute, // ✅ dùng đúng khóa ngoại
    //             },
    //             transaction: t,
    //           });

    //           if (value) {
    //             value.value = val.value || value.value;
    //             value.extra_price = val.extraPrice ?? value.extra_price;
    //             value.quantity = val.quantity ?? value.quantity;
    //             value.status = val.status ?? value.status;
    //             value.color_code = val.color_code ?? value.color_code;
    //             await value.save({ transaction: t });
    //           }
    //         }

    //         // Nếu không tìm thấy thì tạo mới
    //         if (!value) {
    //           await AttributeValue.create({
    //             id_attribute: attribute.id_attribute,
    //             value: val.value,
    //             extra_price: val.extraPrice,
    //             quantity: val.quantity,
    //             status: val.status,
    //             color_code: val.color_code,
    //           }, { transaction: t });
    //         }
    //       }
    //     }
    //   }
    // }

    // // --- Cập nhật variants (SKU) ---
    // if (variants) {
    //   const skus = typeof variants === "string" ? JSON.parse(variants) : variants;

    //   for (const sku of skus) {
    //     let variant;

    //     if (sku.sku_id) {
    //       variant = await ProductVariant.findOne({
    //         where: {
    //           id_variant: sku.sku_id,
    //           id_products: id, 
    //         },
    //         transaction: t,
    //       });

    //       if (variant) {
    //         variant.id_products = id;
    //         variant.sku = sku.sku_code;
    //         variant.price = sku.price;
    //         variant.quantity = sku.quantity;
    //         variant.status = sku.status;
    //         // Thêm cập nhật combo option hoặc ảnh nếu có
    //         await variant.save({ transaction: t });
    //       }
    //     }

    //     if (!variant) {
    //       await ProductVariant.create({
    //         id_products: id,
    //         sku: sku.sku_code, 
    //         price: sku.price,
    //         quantity: sku.quantity,
    //         status: sku.status,
    //         // combo option hoặc ảnh nếu có
    //       }, { transaction: t });
    //     }
    //   }
    // }

exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const t = await sequelize.transaction();

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const {
      products_name,
      products_market_price,
      products_sale_price,
      products_status,
      products_description,
      category_id,
      specs,
      optionImages,
      optionFileMeta,
      main_image_index,
      existingImages,
    } = req.body;

    // === 1. Cập nhật thông tin cơ bản ===
    if (products_name !== undefined) product.products_name = products_name;
    if (products_market_price !== undefined) product.products_market_price = products_market_price;
    if (products_sale_price !== undefined) product.products_sale_price = products_sale_price;
    if (products_status !== undefined) product.products_status = products_status;
    if (products_description !== undefined) product.products_description = products_description;
    if (category_id && category_id !== "null") {
      product.category_id = parseInt(category_id);
    }

    // === 2. Cập nhật thông số kỹ thuật (specs) ===
    if (specs) {
      const specsParsed = JSON.parse(specs);
      const oldSpecs = await ProductSpec.findAll({ where: { id_products: id }, transaction: t });
      const oldMap = new Map(oldSpecs.map(s => [s.id_spec, s]));
      const newIds = specsParsed.filter(s => s.id_spec).map(s => Number(s.id_spec));

      // Xoá spec cũ không còn
      for (const oldSpec of oldSpecs) {
        if (!newIds.includes(oldSpec.id_spec)) {
          await oldSpec.destroy({ transaction: t });
        }
      }

      // Cập nhật hoặc thêm mới
      for (const spec of specsParsed) {
        if (spec.id_spec && oldMap.has(Number(spec.id_spec))) {
          const s = oldMap.get(Number(spec.id_spec));
          s.spec_name = spec.name;
          s.spec_value = spec.value;
          await s.save({ transaction: t });
        } else {
          await ProductSpec.create({
            id_products: id,
            spec_name: spec.name,
            spec_value: spec.value,
          }, { transaction: t });
        }
      }
    }

    // === 3. Ảnh OPTION (optionImages và optionFiles) ===

    // Parse ảnh option cũ
    let parsedOptionImages = [];
    if (optionImages) {
      try {
        parsedOptionImages = typeof optionImages === "string" ? JSON.parse(optionImages) : optionImages;
      } catch (e) {
        console.error("Lỗi parse optionImages:", e);
      }
    }

    const keepOptionImgIds = parsedOptionImages.map(img => img.id_product_img).filter(Boolean);

    const oldOptionImgs = await ProductImg.findAll({
      where: { id_products: id, id_value: { [Op.ne]: null } },
      transaction: t,
    });

    // Xoá ảnh option cũ không dùng nữa
    for (const img of oldOptionImgs) {
      if (!keepOptionImgIds.includes(img.id_product_img)) {
        const imgPath = path.join(__dirname, "../..", img.Img_url);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        await img.destroy({ transaction: t });
      }
    }

    // Upsert ảnh option cũ
    for (const img of parsedOptionImages) {
      if (!img.Img_url || !img.id_value) continue;
      await ProductImg.upsert({
        id_product_img: img.id_product_img || undefined,
        id_products: id,
        id_value: img.id_value,
        Img_url: img.Img_url,
        is_main: !!img.is_main,
        id_variant: null,
      }, { transaction: t });
    }

    // Xử lý ảnh mới từ FE (optionFiles)
    const optionFiles = req.files?.optionFiles || [];
    let optionFileMetas = [];

    try {
      if (typeof optionFileMeta === "string") {
        optionFileMetas = JSON.parse(optionFileMeta);
      } else if (Array.isArray(optionFileMeta)) {
        optionFileMetas = optionFileMeta.map(m => (typeof m === "string" ? JSON.parse(m) : m));
      }
    } catch (e) {
      console.error("Lỗi parse optionFileMeta:", e);
    }

    for (let i = 0; i < optionFiles.length; i++) {
      const file = optionFiles[i];
      const meta = optionFileMetas[i] || {};
      if (!meta.id_value) continue;

      const filename = path.basename(file.path);
      const dbPath = "/uploads/" + filename;

      await ProductImg.create({
        id_products: id,
        id_value: meta.id_value,
        Img_url: dbPath,
        is_main: !!meta.is_main,
        id_variant: null,
      }, { transaction: t });
    }

    // === xử lý thông tin chung của option
    // === xử lý thông tin chung của option
  try {
    const attributes = typeof req.body.attributes === "string"
      ? JSON.parse(req.body.attributes)
      : req.body.attributes;

    console.log("📌 attributes received:", attributes);

    for (const attr of attributes) {
      for (const val of attr.values || []) {
        const idVal = val.value_id || val.id_value || val.idVal;
        if (!idVal) continue;

        const exists = await AttributeValue.findOne({
          where: { id_value: Number(idVal) },
          transaction: t,
        });
        if (!exists) {
          console.warn(`⚠️ Không tìm thấy attribute_value với id_value = ${idVal}`);
          continue;
        }

        const extraPrice = val.extra_price ?? val.extraPrice ?? 0;
        const quantity = val.quantity ?? 0;
        const statusInput = val.status;

        const parsedExtraPrice = parseFloat(extraPrice);
        const parsedQuantity = parseInt(quantity, 10);
        const parsedStatus = [1, '1', true].includes(statusInput);

        if (
          isNaN(parsedExtraPrice) ||
          isNaN(parsedQuantity) ||
          typeof parsedStatus !== 'boolean'
        ) {
          console.warn(`⚠️ Dữ liệu không hợp lệ cho id_value = ${idVal}`, { extraPrice, quantity, statusInput });
          continue;
        }

        console.log("🔁 Chuẩn bị save:", {
          id_value: idVal,
          value: val.value,
          extra_price: parsedExtraPrice,
          quantity: parsedQuantity,
          status: parsedStatus,
        });

        // Gán trường mới dù giá trị giống hay không
        exists.value = val.value?.toString() || '';
        exists.extra_price = parsedExtraPrice;
        exists.quantity = parsedQuantity;
        exists.status = parsedStatus;

        // Lưu dữ liệu xuống DB
        await exists.save({ transaction: t });
        console.log(`✅ Đã save id_value=${idVal}`);
      }
    }
  } catch (err) {
    await t.rollback();
    console.error("❌ Error updating attributes:", err);
    return res.status(500).json({ message: "Lỗi khi cập nhật attributes", error: err.message });
  }

    // === 4. Ảnh CHUNG (images) ===

    // Parse existingImages
    let existingImagesParsed = [];
    try {
      if (typeof existingImages === "string") {
        const parsed = JSON.parse(existingImages);
        existingImagesParsed = Array.isArray(parsed) ? parsed : [parsed];
      } else if (Array.isArray(existingImages)) {
        existingImagesParsed = existingImages.map(e =>
          typeof e === "string" ? JSON.parse(e) : e
        );
      }
    } catch (e) {
      console.error("Lỗi parse existingImages:", e);
    }

    const keepImageIds = existingImagesParsed.map(img => img.id).filter(Boolean);
    const oldImages = await ProductImg.findAll({
      where: { id_products: id, id_variant: null, id_value: null },
      transaction: t,
    });

    for (const img of oldImages) {
      if (!keepImageIds.includes(img.id_product_img)) {
        const imgPath = path.join(__dirname, "../..", img.Img_url);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        await img.destroy({ transaction: t });
      }
    }

    // Thêm ảnh mới (images)
    const files = req.files?.images || [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dbPath = "/uploads/" + path.basename(file.path);
      await ProductImg.create({
        id_products: id,
        Img_url: dbPath,
        is_main: false,
        id_variant: null,
        id_value: null,
      }, { transaction: t });
    }

    // Đặt lại ảnh đại diện
    const allImages = await ProductImg.findAll({
      where: { id_products: id, id_variant: null, id_value: null },
      order: [["id_product_img", "ASC"]],
      transaction: t,
    });

    const mainIndex = main_image_index != null && !isNaN(main_image_index) && main_image_index < allImages.length
      ? parseInt(main_image_index)
      : 0;

    for (let i = 0; i < allImages.length; i++) {
      await allImages[i].update({ is_main: i === mainIndex }, { transaction: t });
    }

    // === 5. Lưu lại product ===
    await product.save({ transaction: t });
    await t.commit();

    return res.json({ message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    await t.rollback();
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
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

    // console.log('Product with category:', JSON.stringify(product.toJSON(), null, 2)); // Debug

    // 2. Ảnh sản phẩm
    const images = await ProductImg.findAll({
      where: { 
        id_products: id,
        id_value: null,
        id_variant: null,
        is_main: true 
      },
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
          attributes: ['id_attribute', 'name'],
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
                  where: { id_products: id },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
    // console.log('ProductAttribute sample:', JSON.stringify(productAttributes, null, 2));
    const attributes = productAttributes
    .filter(pa => pa.attribute && Array.isArray(pa.attribute.values))
    .map(pa => {
      const filteredValues = pa.attribute.values.filter(
        v => v.productAttributeValues && v.productAttributeValues.length > 0
      );

      return {
        attribute_id: pa.attribute.id_attribute,
        name: pa.attribute.name,
        type: pa.attribute.type,
        values: filteredValues.map(v => ({
          id_value: v.id_value,
          value: v.value,
          extra_price: v.extra_price,
          quantity: v.quantity,
          status: v.status,
          images: v.images || [],
        }))
      };
    });

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

    const skus = variantsRaw
      .filter(variant => variant.variantValues.length === attributes.length)
      .map(variant => ({
        variant_id: variant.id_variant,
        sku_code: variant.sku,
        quantity: variant.quantity,
        price: variant.price,
        status: variant.status,
        images: variant.images || [],
        option_combo: variant.variantValues.map(v => ({
          attribute: v.attributeValue?.attribute?.name,
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

    // console.log('Final response:', JSON.stringify(response, null, 2)); // Debug
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
          as: "images",
          where: { is_main: true, id_value: null, id_variant: null },
          required: false,  // nếu sản phẩm chưa có ảnh đại diện vẫn lấy được
          attributes: ["Img_url", "is_main"],
          // limit: 1,
        },
      ],
      order: [["id_products", "DESC"]],
    });

    const formatted = products.map((p) => ({
      products_id: p.id_products,
      products_name: p.products_name,
      market_price: parseFloat(p.products_market_price),
      sale_price: parseFloat(p.products_sale_price),
      products_primary: Number(p.products_primary),
      products_status: p.products_status,
      main_image_url: p.images?.[0]?.Img_url || null,
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