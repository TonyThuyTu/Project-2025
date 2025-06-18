const { Category, Product, ProductImg } = require('../models/index.model');

// Lấy tất cả danh mục
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parent_id: null }, // Bỏ is_active tạm thời
      attributes: ['category_id', 'name', 'img', 'is_active', 'is_primary', 'parent_id'],
      include: [
        {
          model: Category,
          as: 'children',
          attributes: ['category_id', 'name', 'img', 'is_active', 'is_primary', 'parent_id'],
          required: false, // Bao gồm cả danh mục cha không có con
          include: [
            {
              model: Category,
              as: 'children',
              attributes: ['category_id', 'name', 'img', 'is_active', 'is_primary', 'parent_id'],
              required: false,
            },
          ],
        },
      ],
      order: [['category_id', 'ASC'], [{ model: Category, as: 'children' }, 'category_id', 'ASC']],
    });

    res.json(categories);
  } catch (err) {
    console.error('Lỗi khi lấy danh mục:', err);
    res.status(500).json({ error: err.message });
  }
};


// Lấy danh mục theo ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh mục con theo parent_id
exports.getChildrenByParentId = async (req, res) => {
  try {
    const children = await Category.findAll({ where: { parent_id: req.params.parentId } });
    res.json(children);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Thêm danh mục
exports.createCategory = async (req, res) => {
  try {
    const { name, parent_id, is_active, is_primary } = req.body;
    const banner = req.file ? req.file.filename : null;

    const exists = await Category.findOne({ where: { name, parent_id: parent_id ?? null } });
    if (exists) return res.status(400).json({ message: 'Danh mục đã tồn tại' });

    const newCat = await Category.create({
      name,
      parent_id: parent_id || null,
      is_active: is_active === 'true' || is_active === true,
      is_primary: is_primary === 'true' || is_primary === true,
      img: banner
    });

    res.status(201).json(newCat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

//ẩn hiện danh mục
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy category theo id
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Danh mục không tồn tại' });

    // Đảo trạng thái is_active
    category.is_active = !category.is_active;
    await category.save();

    res.json({ message: 'Cập nhật trạng thái ẩn/hiện thành công', category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


//ghim danh mục lên trang chủ
exports.togglePrimary = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    // Đổi trạng thái is_primary (ghim hoặc bỏ ghim)
    category.is_primary = !category.is_primary;
    await category.save();

    return res.status(200).json({ 
      message: category.is_primary ? 'Đã ghim danh mục' : 'Đã bỏ ghim danh mục',
      category 
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, parent_id, is_active, is_primary } = req.body;

  try {
    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Danh mục không tồn tại' });

    // Nếu có file ảnh mới, xử lý upload (nếu dùng multer)
    if (req.file) {
      category.img = req.file.filename;
    }

    category.name = name || category.name;
    category.parent_id = parent_id || null;
    category.is_active = is_active !== undefined ? is_active : category.is_active;
    category.is_primary = is_primary !== undefined ? is_primary : category.is_primary;

    await category.save();
    res.json({ message: 'Cập nhật thành công', category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.destroy({ where: { category_id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//for guest
exports.getParentCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: 0, parent_id: null },
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// controllers/category.controller.js
exports.getCategoryDetail = async (req, res) => {
  const { name } = req.params;

  try {
    // 1. Lấy thông tin danh mục cha
    const parentCategory = await Category.findOne({
      where: { name, parent_id: null },
      attributes: ['category_id', 'name', 'img'],
    });

    if (!parentCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const parentId = parentCategory.category_id;

    // 2. Lấy danh mục con
    const children = await Category.findAll({
      where: { parent_id: parentId },
      attributes: ['category_id', 'name', 'img'],
    });

    const childIds = children.map(child => child.category_id);
    const allCategoryIds = [parentId, ...childIds];

    // 3. Lấy sản phẩm theo cả cha và con
    const products = await Product.findAll({
      where: {
        category_id: allCategoryIds,
        products_status: 2,
      },
      attributes: [
        'id_products',
        'products_name',
        'products_market_price',
        'products_sale_price',
        'category_id'
      ],
      include: [
        {
          model: ProductImg,
          as: 'images',
          required: false,
          attributes: ['Img_url', 'is_main'],
          where: { is_main: true },
        },
      ],
    });

    // 4. Trả về dữ liệu tổng hợp
    res.json({
      category_id: parentId,
      name: parentCategory.name,
      img: parentCategory.img,
      children,
      products, // bao gồm sản phẩm của cả cha và con
    });

  } catch (err) {
    console.error("Lỗi khi lấy chi tiết danh mục:", err);
    res.status(500).json({ error: err.message });
  }
};
