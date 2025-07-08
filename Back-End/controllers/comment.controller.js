const { ProductReview, 
        Product, 
        Customer 
    } = require('../models/index.model');

//post a comments
exports.postReview = async (req, res) => {
  try {
    const {
      id_customer,
      id_products,
      rating,
      title,
      comment,
      approved = 'Pending', // mặc định
    } = req.body;

    // 1. Kiểm tra id_products có tồn tại không
    const product = await Product.findByPk(id_products);
    if (!product) {
      return res.status(400).json({ message: 'Sản phẩm không tồn tại' });
    }

    // 2. Kiểm tra id_customer có tồn tại không
    const customer = await Customer.findByPk(id_customer);
    if (!customer) {
      return res.status(400).json({ message: 'Khách hàng không tồn tại' });
    }

    // 3. Tạo bình luận mới
    const newReview = await ProductReview.create({
      id_customer,
      id_products,
      rating,
      title,
      comment,
      approved,
      date: new Date(), // hoặc để default của DB
    });

    res.status(201).json({ message: 'Đánh giá đã được thêm', review: newReview });
  } catch (error) {
    console.error('Lỗi khi thêm đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

//get review by id
exports.getReviewById = async (req, res) => {
  try {
    const id_review = req.params.id;

    const review = await ProductReview.findOne({
      where: { id_review },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id_customer', 'name'],
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id_products', 'products_name'],
        },
      ],
    });

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    // Trả dữ liệu dạng object, không map vì chỉ có 1 review
    res.json({
      id_review: review.id_review,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      approved: review.approved,
      date: review.date,
      customer: review.customer,
      product: review.product,
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


//get all review
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await ProductReview.findAll({
      attributes: ['id_review', 'title', 'rating', 'approved', 'date'],
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id_customer', 'name'],
        },
        {
          model: Product,
          as: 'product',       // nhớ đúng alias bạn đã khai báo
          attributes: ['products_name'],
        },
      ],
      order: [['date', 'DESC']], // sắp xếp mới nhất lên đầu
    });

    const formatted = reviews.map(r => ({
      id_review: r.id_review,
      title: r.title,
      rating: r.rating,
      approved: r.approved,
      date: r.date,
      products_name: r.product?.products_name || null,
      name: r.customer.name
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

//approve
exports.reviewApprove = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { approved } = req.body;

  if (!approved) {
    return res.status(400).json({ message: 'Chưa truyền trạng thái duyệt' });
  }

  try {
    const review = await ProductReview.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Bình luận không tồn tại' });
    }

    review.approved = approved;
    await review.save();

    return res.json({ message: 'Cập nhật trạng thái duyệt thành công', review });
  } catch (error) {
    console.error('Lỗi khi duyệt bình luận:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

