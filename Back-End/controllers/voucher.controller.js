const db = require('../models/index.model');
const Voucher = db.Voucher;
const Product = db.Product;
const VoucherProduct = db.VoucherProduct;

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
      productIds, // mảng id sản phẩm
    } = req.body;

    // Kiểm tra bắt buộc
    if (!name || !code || !description || !discount_type || !discount_value) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc." });
    }

    // Kiểm tra discount_type hợp lệ
    if (!["percent", "fixed"].includes(discount_type)) {
      return res.status(400).json({ message: "Loại giảm giá không hợp lệ. Chỉ nhận 'percent' hoặc 'fixed'." });
    }

    // Kiểm tra code trùng
    const existing = await Voucher.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại, vui lòng nhập mã khác." });
    }

    // Kiểm tra ngày bắt đầu và kết thúc nếu có
    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu." });
    }

    // Ép kiểu số cho các trường có thể nhận null
    min_order_value = min_order_value ? parseFloat(min_order_value) : null;
    user_limit = user_limit ? parseInt(user_limit) : null;
    usage_limit = usage_limit ? parseInt(usage_limit) : null;
    status = status !== undefined ? parseInt(status) : 1;

    // Tạo voucher
    const newVoucher = await Voucher.create({
      name,
      code,
      description,
      discount_type,
      discount_value: parseFloat(discount_value),
      min_order_value,
      user_limit,
      usage_limit,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      status,
    }, { transaction: t });

    // Liên kết sản phẩm nếu có
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
    console.error("Lỗi khi tạo voucher:", error);
    await t.rollback();
    res.status(500).json({ message: "Đã xảy ra lỗi khi tạo voucher." });
  }
};

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