const db = require('../models/index.model');
const sendOrderConfirmationEmail = require('../utils/mailCheckOut');
const { Op } = require('sequelize');

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
    // Lấy query params
    const {
      page = 1,
      limit = 7,
      payment_method,
      order_status,
      payment_status,
      order_date,
      
    } = req.query;

    const offset = (page - 1) * limit;

    // Build điều kiện where cho Order
    const whereOrder = {};
    if (payment_method) whereOrder.payment_method = payment_method;
    if (order_status) whereOrder.order_status = order_status;

    // Build điều kiện cho payment_status sẽ xử lý bên dưới

    // Điều kiện ngày (nếu có)
    if (order_date) {
      const dayStart = new Date(order_date);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(order_date);
      dayEnd.setHours(23, 59, 59, 999);

      whereOrder.order_date = {
        [Op.gte]: dayStart,
        [Op.lte]: dayEnd,
      };
    }

    // Lấy dữ liệu với phân trang
    const { count, rows: orders } = await db.Order.findAndCountAll({
      where: whereOrder,
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
          where: payment_status ? { payment_status } : undefined, // lọc payment_status
          required: payment_status ? true : false, // join inner nếu filter, outer nếu không
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
        'total_amount',
        'payment_method',
        'order_date',
        'order_status'
      ],
      order: [['order_date', 'DESC']],
      limit: Number(limit),
      offset: Number(offset),
      distinct: true, // để count đúng khi join
    });

    // Map lại dữ liệu trả về
    const shippingStatusMap = {
      'pending': 1,
      'delivering': 2,
      'delivered': 3,
      'cancelled': 4
    };

    const formatted = orders.map(order => {
      let pay_status = 1; // pending
      if (order.payment_method === 1) {
        pay_status = order.order_status === 'delivered' ? 2 : 1;
      } else {
        pay_status = order.payment?.payment_status || 1;
      }

      const shipping_status_text = order.shipping_info?.shipping_status || 'pending';
      const shipping_status = shippingStatusMap[shipping_status_text] || 1;

      return {
        id: order.id_order,
        name: order.name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        total_amount: order.total_amount,
        customer_name: order.customer?.name || '',
        payment_method: order.payment_method,
        order_status: order.order_status,
        order_date: order.order_date,
        payment_status: pay_status,
        payment_time: order.payment?.payment_time || null,
        shipping_status,
        shipping_status_text,
      };
    });

    res.status(200).json({
      total: count,
      page: Number(page),
      pageSize: Number(limit),
      data: formatted,
    });

  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng." });
  }
};

//get detail
exports.getOrderDetail = async (req, res) => {
  const id = req.params.id;

  try {
    const order = await db.Order.findOne({
      where: { id_order: id },
      attributes: [
        'id_order', 'id_customer', 'name', 'phone', 'email',
        'address', 'total_amount', 'payment_method', 'order_status',
        'order_date', 'shipping_fee', 'note'
      ],
      include: [
        {
          model: db.Customer,
          as: 'customer',
          attributes: ['name', 'email', 'phone', 'given_name', 'last_name'],
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
        },
        {
          model: db.OrderDetail,
          as: 'order_details',
          
          include: [
            {
              model: db.Product,
              as: 'product',
              attributes: [
                'id_products', 'products_name', 'products_slug',
                'products_market_price', 'products_sale_price',
                // Nếu bạn có include attributes, skus ở đây thì tốt, hoặc load ở step khác
              ],
              include: [
                {
                  model: db.ProductAttributeValue, // hoặc tên model đúng của attribute_values
                  as: 'productAttributeValues',
                  include: [
                    {
                      model: db.AttributeValue,
                      as: 'attributeValue',
                      attributes: ['extra_price'],
                    }
                  ]
                },
                {
                  model: db.ProductVariant,
                  as: 'variants',
                  attributes: ['price', 'price_sale'],
                }
              ],
            },
            {
              model: db.OrderItemAttributeValue,
              as: 'attribute_values',
              include: [
                {
                  model: db.AttributeValue,
                  as: 'attribute_value',
                  attributes: ['value', 'value_note', 'extra_price'],
                },
              ],
            },
            {
              model: db.ProductVariant,
              as: 'variant',
              attributes: ['price', 'price_sale'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }


    res.status(200).json(order);
  } catch (error) {
    console.error('Lỗi lấy chi tiết đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết đơn hàng' });
  }
};

exports.getOrdersByCustomerId = async (req, res) => {
  const customerId = req.params.id;

  if (!customerId) {
    return res.status(400).json({ error: "Thiếu id khách hàng" });
  }

  try {
    const orders = await db.Order.findAll({
      where: { id_customer: customerId },
      attributes: [
        "id_order",
        "Order_date",
        "payment_method",
        "order_status",
        // "shipping_status",
        "total_amount",
      ],
      order: [["id_order", "DESC"]],
    });

    return res.json(orders);
  } catch (error) {
    console.error("Lỗi lấy đơn hàng theo khách hàng:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
