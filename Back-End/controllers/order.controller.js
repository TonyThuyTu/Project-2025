const db = require('../models/index.model');
const sendOrderConfirmationEmail = require('../utils/mailCheckOut');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { createMoMoPaymentUrl } = require('../utils/momoPayment');

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

    if (!id_customer || !name || !phone || !email || !address ||
        !payment_method || !Array.isArray(cart_items) || cart_items.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng." });
    }

    const paymentMethodMap = { 1: 'cod', 2: 'online' };
    const paymentMethodText = paymentMethodMap[payment_method];
    if (!paymentMethodText) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ." });
    }

    let total_amount = 0;
    const shipping_fee = 0;
    const orderDetails = [];

    // Tính tổng và chuẩn bị orderDetails
    for (const item of cart_items) {
      const product = await db.Product.findByPk(item.id_product);
      if (!product) throw new Error(`Sản phẩm với ID ${item.id_product} không tồn tại.`);

      let price = parseFloat(product.products_price);
      let id_variant = null;
      const options = item.attribute_value_ids || [];

      if (item.id_variant) {
        const variant = await db.ProductVariant.findByPk(item.id_variant);
        if (variant) {
          price = parseFloat(variant.price || variant.price_sale || price);
          id_variant = variant.id_variant;
        }
      } else if (options.length > 0) {
        const attrs = await db.AttributeValue.findAll({ where: { id_value: options } });
        for (const attr of attrs) price += parseFloat(attr.extra_price || 0);
      }

      const itemTotal = price * item.quantity;
      total_amount += itemTotal;

      orderDetails.push({
        id_product: item.id_product,
        id_variant,
        product_name: product.products_name,
        quantity: item.quantity,
        final_price: price,
        options
      });
    }

    const totalAmountFromClient = parseFloat(req.body.total_amount);
    const totalAmountToSave = (!isNaN(totalAmountFromClient) && totalAmountFromClient > 0)
      ? totalAmountFromClient
      : total_amount;

    // Nếu là thanh toán online, tạo link MoMo trước
    let payUrl = null;
    if (payment_method === 2) {
      try {
        const tempOrderId = `ORDER_TMP_${Date.now()}`;
        payUrl = await createMoMoPaymentUrl({
          amount: totalAmountToSave.toString(),
          orderId: tempOrderId,
          orderInfo: `Thanh toán đơn hàng`
        });
      } catch (err) {
        console.error("Lỗi tạo link thanh toán MoMo:", err);
        await t.rollback();
        return res.status(500).json({ message: "Lỗi thanh toán MoMo", error: err.message });
      }
    }

    // Tạo đơn hàng (chỉ khi MoMo đã tạo link thành công hoặc COD)
    const newOrder = await db.Order.create({
      id_customer,
      name,
      phone,
      email,
      address,
      total_amount: totalAmountToSave,
      shipping_fee,
      payment_method,
      order_status: 1,
      note
    }, { transaction: t });

    for (const detail of orderDetails) {
      const orderDetail = await db.OrderDetail.create({
        id_order: newOrder.id_order,
        id_variant: detail.id_variant,
        id_product: detail.id_product,
        product_name: detail.product_name,
        quantity: detail.quantity,
        final_price: detail.final_price
      }, { transaction: t });

      if (detail.options.length > 0) {
        const optionRecords = detail.options.map(id_value => ({
          id_order_detail: orderDetail.id_order_detail,
          id_value
        }));
        await db.OrderItemAttributeValue.bulkCreate(optionRecords, { transaction: t });
      }
    }

    await db.Payment.create({
      id_order: newOrder.id_order,
      payment_method,
      payment_status: payment_method === 2 ? 0 : 1, // online chưa thanh toán thì status = 0
      amount: totalAmountToSave + shipping_fee,
      payment_date: null
    }, { transaction: t });

    // Chỉ gửi email khi COD hoặc khi online đã thanh toán (nếu xử lý callback MoMo thì gửi ở đó)
    if (payment_method === 1) {
      await sendOrderConfirmationEmail(email, {
        id_order: newOrder.id_order,
        name,
        phone,
        email,
        address,
        total_amount: totalAmountToSave,
        payment_method: paymentMethodText,
        order_date: newOrder.order_date,
        products: orderDetails,
        note
      });
    }

    await t.commit();

    if (payment_method === 2) {
      return res.status(200).json({
        message: "Tạo đơn thành công, vui lòng thanh toán online",
        order_id: newOrder.id_order,
        payment_method: 'online',
        payUrl
      });
    }

    return res.status(200).json({
      message: "Đặt hàng thành công",
      order_id: newOrder.id_order,
      payment_method: 'cod'
    });

  } catch (error) {
    await t.rollback();
    console.error("Checkout Error:", error);
    return res.status(500).json({ message: "Lỗi khi đặt hàng", error: error.message });
  }
};

//IPN Momo
exports.momoIPN = async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = req.body;

    const rawSignature =
      `accessKey=F8BBA842ECF85` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac('sha256', 'K951B6PE1waDMi640xX08PD3vg6EkVlz')
      .update(rawSignature)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Chữ ký không hợp lệ' });
    }

    // Nếu thanh toán thành công
    if (resultCode === 0) {
      // Cập nhật đơn hàng
      await db.Payment.update(
        { payment_status: 1, payment_date: new Date() },
        { where: { id_order: myOrderId} }
      );

      // Gửi email xác nhận ở đây
      // await sendOrderConfirmationEmail(...);
    }

    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('MoMo IPN error:', error);
    return res.status(500).json({ message: 'Server error' });
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
              ],
              include: [
                {
                  model: db.ProductAttributeValue,
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
              include: [
                {
                  model: db.VariantValue,
                  as: 'variantValues',
                  include: [
                    {
                      model: db.AttributeValue,
                      as: 'attributeValue',
                      attributes: ['value', 'value_note', 'extra_price'],
                      include: [
                        {
                          model: db.Attribute,
                          as: 'attribute',
                          attributes: ['name', 'type']
                        }
                      ]
                    }
                  ]
                }
              ]
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
