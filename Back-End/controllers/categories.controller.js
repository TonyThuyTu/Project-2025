const Category = require('../models/categories');

// Lấy tất cả danh mục
exports.getCategories = (req, res) => {
  Category.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Lấy danh mục theo ID
exports.getCategoryById = (req, res) => {
  Category.getById(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result[0]);
  });
};

// Lấy danh mục con theo parent_id
exports.getChildrenByParentId = (req, res) => {
  Category.getChildren(req.params.parentId, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Thêm danh mục
exports.createCategory = (req, res) => {
  const { name, parent_id } = req.body;

  Category.exists(name, parent_id || null, (err, results) => {
    if (err) {
      console.error('Lỗi khi kiểm tra tồn tại danh mục:', err);
      return res.status(500).json({ error: err });
    }
    if (results.length > 0) {
      console.log(`Danh mục đã tồn tại: name=${name}, parent_id=${parent_id}`);
      return res.status(400).json({ message: 'Danh mục đã tồn tại' });
    }

    Category.create({ name, parent_id: parent_id || null }, (err, result) => {
      if (err) {
        console.error('Lỗi khi tạo danh mục mới:', err);
        return res.status(500).json({ error: err });
      }
      console.log(`Tạo danh mục mới thành công, id=${result.insertId}`);
      res.status(201).json({ message: 'Created', id: result.insertId });
    });
  });
};

// Chỉnh sửa danh mục
exports.updateCategory = (req, res) => {
  const { name, parent_id } = req.body;
  const id = req.params.id;

  Category.exists(name, parent_id || null, (err, results) => {
    if (err) {
      console.error('Lỗi khi kiểm tra tồn tại danh mục (update):', err);
      return res.status(500).json({ error: err });
    }
    if (results.length > 0 && results[0].category_id != id) {
      console.log(`Danh mục đã tồn tại khi cập nhật: name=${name}, parent_id=${parent_id}`);
      return res.status(400).json({ message: 'Danh mục đã tồn tại' });
    }

    Category.update(id, { name, parent_id: parent_id || null }, (err) => {
      if (err) {
        console.error('Lỗi khi cập nhật danh mục:', err);
        return res.status(500).json({ error: err });
      }
      console.log(`Cập nhật danh mục thành công, id=${id}`);
      res.json({ message: 'Updated' });
    });
  });
};


// Xóa danh mục
exports.deleteCategory = (req, res) => {
  Category.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Deleted' });
  });
};
