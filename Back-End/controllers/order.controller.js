const db = require('../models/index.model');
const sendOrderConfirmationEmail = require('../utils/mailCheckOut');

exports.checkout = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      id_customer,
      name,
      phone,
      email,
      address,
      payment_method,
      cart_items,
      note
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (
      !id_customer || !name || !phone || !email || !address ||
      !payment_method || !Array.isArray(cart_items) || cart_items.length === 0
    ) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng." });
    }

    // Kiểm tra phương thức thanh toán
    const paymentMethodMap = { 1: 'cod', 2: 'vnpay' };
    const paymentMethodText = paymentMethodMap[payment_method];
    if (!paymentMethodText) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ." });
    }

    // Xử lý địa chỉ
    let fullAddress = '';
    if (typeof address === 'string') {
      fullAddress = address;
    } else if (address?.fullAddress) {
      fullAddress = address.fullAddress;
    } else if (address?.address && address?.ward && address?.city) {
      fullAddress = `${address.address}, ${address.ward}, ${address.city}`;
    } else {
      return res.status(400).json({ message: "Thiếu thông tin địa chỉ giao hàng." });
    }

    let total_amount = 0;
    const shipping_fee = 0;
    const orderDetails = [];

    // Tính tổng tiền và chuẩn bị chi tiết đơn hàng
    for (const item of cart_items) {
      const product = await db.Product.findByPk(item.id_product);
      if (!product) {
        throw new Error(`Sản phẩm với ID ${item.id_product} không tồn tại.`);
      }

      const itemTotal = parseFloat(product.products_sale_price) * item.quantity;
      total_amount += itemTotal;

      orderDetails.push({
        id_product: item.id_product,
        product_name: product.products_name,
        quantity: item.quantity,
        price: parseFloat(product.products_sale_price),
        options: item.attribute_value_ids || [],
      });
    }

    // Tạo đơn hàng
    const newOrder = await db.Order.create({
      id_customer,
      name,
      phone,
      email,
      address: fullAddress,
      total_amount,
      shipping_fee,
      payment_method,
      order_status: 'pending',
      note,
    }, { transaction: t });

    // Tạo chi tiết đơn hàng và thuộc tính
    for (const detail of orderDetails) {
      const orderDetail = await db.OrderDetail.create({
        id_order: newOrder.id_order,
        id_product: detail.id_product,
        product_name: detail.product_name,
        quantity: detail.quantity,
      }, { transaction: t });

      if (Array.isArray(detail.options)) {
        for (const id_value of detail.options) {
          await db.OrderItemAttributeValue.create({
            id_order_detail: orderDetail.id_order_detail,
            id_value,
          }, { transaction: t });
        }
      }
    }

    // Tạo bản ghi thanh toán
    await db.Payment.create({
      id_order: newOrder.id_order,
      payment_method: paymentMethodText,
      payment_status: 'unpaid',
      amount: total_amount + shipping_fee,
      payment_date: null,
    }, { transaction: t });

    // Gửi email xác nhận đơn hàng
    await sendOrderConfirmationEmail(email, {
      id_order: newOrder.id_order,
      name,
      phone,
      email,
      address: fullAddress,
      total_amount,
      payment_method: paymentMethodText,
      order_date: newOrder.order_date,
      products: orderDetails,
      note,
    });

    await t.commit();

    return res.status(200).json({
      message: "Đặt hàng thành công",
      order_id: newOrder.id_order,
      payment_method: paymentMethodText,
    });

  } catch (error) {
    await t.rollback();
    console.error("Checkout Error:", error);
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
        'name',
        'phone',
        'email',
        'address',
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
        name: order.name,
        email: order.email,
        phone: order.phone,
        address: order.address,
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
