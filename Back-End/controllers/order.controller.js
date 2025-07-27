const db = require('../models/index.model');
const sendOrderConfirmationEmail = require('../utils/mailCheckOut');

exports.checkout = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id_customer, id_address, payment_method, cart_items, note } = req.body;

    if (!id_customer || !id_address || !payment_method || !Array.isArray(cart_items) || cart_items.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng." });
    }

    if (![1, 2].includes(payment_method)) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ." });
    }

    // Map phương thức thanh toán
    const paymentMethodMap = {
      1: 'Thanh toán khi nhận hàng (COD)',
      2: 'Thanh toán online',
    };
    const paymentMethodText = paymentMethodMap[payment_method] || 'Không xác định';

    const shippingAddress = await db.Address.findOne({
      where: { id_address, id_customer }
    });
    if (!shippingAddress) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ giao hàng." });
    }

    let total_amount = 0;
    const shipping_fee = 0;

    for (const item of cart_items) {
      const product = await db.Product.findByPk(item.id_product);
      if (!product) {
        throw new Error(`Sản phẩm với ID ${item.id_product} không tồn tại.`);
      }
      total_amount += parseFloat(product.products_sale_price) * item.quantity;
    }

    const newOrder = await db.Order.create({
      id_customer,
      total_amount,
      shipping_fee,
      payment_method,
      order_status: 1,
      payment_status: payment_method === 1 ? 'unpaid' : 'unpaid',
      note,
      address_label: shippingAddress.address_label,
      name_address: shippingAddress.name_address,
      name_ward: shippingAddress.name_ward,
      name_city: shippingAddress.name_city,
    }, { transaction: t });

    for (const item of cart_items) {
      const product = await db.Product.findByPk(item.id_product);
      const orderDetail = await db.OrderDetail.create({
        id_order: newOrder.id_order,
        id_product: item.id_product,
        product_name: product.products_name,
        quantity: item.quantity,
      }, { transaction: t });

      if (item.attribute_value_ids && Array.isArray(item.attribute_value_ids)) {
        for (const id_value of item.attribute_value_ids) {
          await db.OrderItemAttributeValue.create({
            id_order_detail: orderDetail.id_order_detail,
            id_value,
          }, { transaction: t });
        }
      }
    }

    // Chuẩn bị dữ liệu cho email
    const customer = await db.Customer.findByPk(id_customer);
    const productsForEmail = [];
  
    for (const item of cart_items) {

      const product = await db.Product.findByPk(item.id_product);
      productsForEmail.push({
        name: product.products_name,
        quantity: item.quantity,
        price: Number(product.products_sale_price).toLocaleString('vi-VN') + ' vnđ',  // Định dạng giá
        options: item.attribute_value_ids || [],
      });
    }

    // Định dạng tổng tiền
    const formattedTotalAmount = total_amount.toLocaleString('vi-VN') + ' vnđ';

    await sendOrderConfirmationEmail(customer.email, {
      orderId: newOrder.id_order,
      products: productsForEmail,
      totalAmount: formattedTotalAmount,
      orderDate: newOrder.order_date,
      customerName: customer.name,
      note: newOrder.note,
      address: `${shippingAddress.address_label} - ${shippingAddress.name_address}, ${shippingAddress.name_ward}, ${shippingAddress.name_city}`,
      paymentMethod: paymentMethodText  // <-- Thêm dòng này
    });

    await t.commit();

    return res.status(200).json({
      message: "Đặt hàng thành công",
      order_id: newOrder.id_order,
      payment_method,
    });

  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(500).json({ message: "Lỗi khi đặt hàng", error: error.message });
  }
};
