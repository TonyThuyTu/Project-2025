const { Category } = require('../models/index.model');

// Lấy tất cả danh mục
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['parent_id', 'ASC'], ['category_id', 'ASC']]
    });
    res.json(categories);
  } catch (err) {
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
  const { name, parent_id } = req.body;
  try {
    const existing = await Category.findOne({
      where: {
        name,
        parent_id: parent_id || null,
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Danh mục đã tồn tại' });
    }

    const category = await Category.create({ name, parent_id: parent_id || null });
    res.status(201).json({ message: 'Created', id: category.category_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  const { name, parent_id } = req.body;
  const id = req.params.id;

  try {
    const existing = await Category.findOne({
      where: {
        name,
        parent_id: parent_id || null,
      }
    });

    if (existing && existing.category_id != id) {
      return res.status(400).json({ message: 'Danh mục đã tồn tại' });
    }

    const [updated] = await Category.update(
      { name, parent_id: parent_id || null },
      { where: { category_id: id } }
    );

    if (updated === 0) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

    res.json({ message: 'Updated' });
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
