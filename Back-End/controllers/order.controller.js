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
      order_status: 1, // chờ xác nhận
      note,
      address_label: shippingAddress.address_label,
      name_address: shippingAddress.name_address,
      name_ward: shippingAddress.name_ward,
      name_city: shippingAddress.name_city,
    }, { transaction: t });

    // Tạo chi tiết đơn hàng
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

    // Tạo bản ghi thanh toán mới
    await db.Payment.create({
      id_order: newOrder.id_order,
      payment_method,
      payment_status: 1, // luôn pending ban đầu
      amount: total_amount + shipping_fee,
      payment_date: null,        // chỉ set khi thanh toán thành công
    }, { transaction: t });

    // Gửi email xác nhận
    const customer = await db.Customer.findByPk(id_customer);
    const productsForEmail = [];

    for (const item of cart_items) {
      const product = await db.Product.findByPk(item.id_product);
      productsForEmail.push({
        name: product.products_name,
        quantity: item.quantity,
        price: Number(product.products_sale_price).toLocaleString('vi-VN') + ' vnđ',
        options: item.attribute_value_ids || [],
      });
    }

    const formattedTotalAmount = total_amount.toLocaleString('vi-VN') + ' vnđ';

    await sendOrderConfirmationEmail(customer.email, {
      orderId: newOrder.id_order,
      products: productsForEmail,
      totalAmount: formattedTotalAmount,
      orderDate: newOrder.order_date,
      customerName: customer.name,
      note: newOrder.note,
      address: `${shippingAddress.address_label} - ${shippingAddress.name_address}, ${shippingAddress.name_ward}, ${shippingAddress.name_city}`,
      paymentMethod: paymentMethodText
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

//get list
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [
        {
          model: db.Customer,
          as: 'customer',
          attributes: ['name'],
        },
        {
          model: db.Payment,
          as: 'payment',
          attributes: ['payment_status', 'payment_time'],
        },
        {
          model: db.ShippingInfo,
          as: 'shipping_info',
          attributes: ['shipping_code', 'shipping_status'],
        }
      ],
      attributes: [
        'id_order',
        'payment_method',
        'order_date',
        'order_status'
      ],
      order: [['order_date', 'DESC']],
    });

    const formatted = orders.map(order => {
      // Handle payment status
      let payment_status = 1; // 1: pending, 2: success, 3: failed

      if (order.payment_method === 1) {
        // COD
        payment_status = order.order_status === 'delivered' ? 2 : 1;
      } else {
        // Online
        payment_status = order.payment?.payment_status || 1;
      }

      // Handle shipping status (giả định ship status đang là string: 'pending', 'delivering', 'delivered')
      // Bạn có thể tùy chỉnh mapping theo hệ thống của bạn
      const shippingStatusMap = {
        'pending': 1,
        'delivering': 2,
        'delivered': 3,
        'cancelled': 4
      };

      const shipping_status_text = order.shipping_info?.shipping_status || 'pending';
      const shipping_status = shippingStatusMap[shipping_status_text] || 1;

      return {
        id: order.id_order,
        customer_name: order.customer?.name || '',
        payment_method: order.payment_method,
        order_status: order.order_status,
        order_date: order.order_date,
        payment_status,             // dạng số: 1, 2, 3
        payment_time: order.payment?.payment_time || null,
        shipping_status,            // dạng số: 1, 2, 3, 4
        shipping_status_text,       // nếu cần hiển thị chuỗi ở FE
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng." });
  }
};
