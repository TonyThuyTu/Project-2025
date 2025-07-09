const db = require('../models/index.model');
const Voucher = db.Voucher;
const Product = db.Product;
const VoucherProduct = db.VoucherProduct;
const { sequelize } = db;

//create voucher
exports.createVoucher = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    let {
      name,
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      user_limit,
      usage_limit,
      start_date,
      end_date,
      status,
      productIds,
    } = req.body;

    // Kiểm tra bắt buộc
    if (!name || !code || !discount_type || !discount_value) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc." });
    }

    // Kiểm tra discount_type hợp lệ
    if (!["percent", "fixed"].includes(discount_type)) {
      return res.status(400).json({ message: "Loại giảm giá không hợp lệ. Chỉ nhận 'percent' hoặc 'fixed'." });
    }

    // Kiểm tra discount_value hợp lệ
    const discountVal = parseFloat(discount_value);
    if (isNaN(discountVal) || discountVal <= 0) {
      return res.status(400).json({ message: "Giá trị giảm giá không hợp lệ." });
    }
    if (discount_type === 'percent' && discountVal > 100) {
      return res.status(400).json({ message: "Giá trị giảm giá phần trăm không được vượt quá 100." });
    }

    // Kiểm tra code trùng
    const existing = await Voucher.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại, vui lòng nhập mã khác." });
    }

    // Kiểm tra ngày bắt đầu và kết thúc
    if (start_date && end_date) {
      const sd = new Date(start_date);
      const ed = new Date(end_date);
      if (sd.toString() === 'Invalid Date' || ed.toString() === 'Invalid Date') {
        return res.status(400).json({ message: "Ngày bắt đầu hoặc kết thúc không hợp lệ." });
      }
      if (sd >= ed) {
        return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu." });
      }
    }

    // Ép kiểu số
    min_order_value = min_order_value ? parseFloat(min_order_value) : null;
    user_limit = user_limit ? parseInt(user_limit) : null;
    usage_limit = usage_limit ? parseInt(usage_limit) : null;
    status = status !== undefined ? parseInt(status) : 1;

    // Tạo voucher
    const newVoucher = await Voucher.create({
      name,
      code,
      description: description || '',
      discount_type,
      discount_value: discountVal,
      min_order_value,
      user_limit,
      usage_limit,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      status,
    }, { transaction: t });

    // Liên kết sản phẩm
    if (Array.isArray(productIds) && productIds.length > 0) {
      const links = productIds.map(productId => ({
        id_voucher: newVoucher.id_voucher,
        id_product: productId,
      }));
      await VoucherProduct.bulkCreate(links, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: "Tạo voucher thành công", voucher: newVoucher });
  } catch (error) {
    console.error("Lỗi khi tạo voucher:", error.message || error);
    await t.rollback();
    res.status(500).json({ message: "Đã xảy ra lỗi khi tạo voucher." });
  }
};

//get list all 
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.findAll({
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id_products', 'products_name', 'products_sale_price'],
          through: { attributes: [] } // không lấy dữ liệu từ bảng trung gian
        }
      ],
      order: [['create_date', 'DESC']] // sắp xếp mới nhất trước
    });

    res.status(200).json({ vouchers });
  } catch (error) {
    console.error('Lỗi lấy danh sách voucher:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách voucher' });
  }
};

//get detail voucher
exports.getVoucherById = async (req, res) => {
  const id = req.params.id;

  try {
    const voucher = await Voucher.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id_products', 'products_name', 'products_sale_price'],
          through: { attributes: [] }, // ẩn bảng trung gian
        },
      ],
    });

    if (!voucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' });
    }

    res.json(voucher);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết voucher:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy chi tiết voucher' });
  }
};

//update voucher
exports.updateVoucher = async (req, res) => {
  const id = req.params.id;

  try {
    const {
      name,
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      user_limit,
      usage_limit,
      start_date,
      end_date,
      status,
      productIds,
    } = req.body;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) return res.status(404).json({ message: 'Voucher không tồn tại' });

    // ✅ Kiểm tra mã code đã tồn tại ở voucher khác chưa
    const existing = await Voucher.findOne({
      where: {
        code,
        id_voucher: { [db.Sequelize.Op.ne]: id }, // khác id hiện tại
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Mã voucher đã tồn tại' });
    }

    // ✅ Cập nhật dữ liệu
    await voucher.update({
      name,
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      user_limit,
      usage_limit,
      start_date,
      end_date,
      status,
    });

    if (Array.isArray(productIds)) {
      await voucher.setProducts(productIds);
    }

    return res.json({ message: 'Cập nhật thành công', voucher });
  } catch (err) {
    console.error('❌ Lỗi update voucher:', err);
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật voucher' });
  }
};