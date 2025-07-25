const db = require('../models/index.model');
const sendOrderConfirmationEmail = require('../utils/mailCheckOut');
const { Op } = require("sequelize");

exports.checkout = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id_customer, shipping_address, payment_method, cart_items } = req.body;

    if (!id_customer || !shipping_address || !payment_method || !Array.isArray(cart_items) || cart_items.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng." });
    }

    let total_amount = 0;
    const shipping_fee = 0; // bạn có thể tính theo địa chỉ sau

    // Tính tổng tiền
    for (const item of cart_items) {
      const product = await db.Product.findByPk(item.id_product);
      if (!product) throw new Error("Sản phẩm không tồn tại");

      const price = product.products_sale_price || 0;
      total_amount += price * item.quantity;
    }

    // 1. Tạo đơn hàng
    const newOrder = await db.Order.create({
      id_customer,
      total_amount,
      shipping_fee,
      payment_method,
      order_status: 'pending',
      payment_status: payment_method === 'cod' ? 'unpaid' : 'unpaid',
    }, { transaction: t });

    // 2. Tạo chi tiết đơn hàng và thuộc tính
    for (const item of cart_items) {
      const product = await db.Product.findByPk(item.id_product);
      const orderDetail = await db.OrderDetail.create({
        id_order: newOrder.id_order,
        id_product: item.id_product,
        product_name: product.products_name,
        quantity: item.quantity
      }, { transaction: t });

      if (item.attribute_value_ids && Array.isArray(item.attribute_value_ids)) {
        for (const id_value of item.attribute_value_ids) {
          await db.OrderItemAttributeValue.create({
            id_order_detail: orderDetail.id_order_detail,
            id_value
          }, { transaction: t });
        }
      }
    }

    // 3. Gửi mail xác nhận (chưa có template nên ví dụ)
    const customer = await db.Customer.findByPk(id_customer);
    await sendMail({
      to: customer.email,
      subject: "Xác nhận đặt hàng",
      html: `<p>Đơn hàng của bạn đã được đặt thành công. Mã đơn hàng: <b>${newOrder.id_order}</b></p>`
    });

    await t.commit();

    return res.status(200).json({
      message: "Đặt hàng thành công",
      order_id: newOrder.id_order,
      payment_method
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Lỗi khi đặt hàng", error: err.message });
  }
};

