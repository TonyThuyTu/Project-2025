const db = require('../config/db');

const Category = {
  // Lấy tất cả danh mục
  getAll: (callback) => {
    const sql = 'SELECT * FROM categories ORDER BY parent_id ASC, category_id ASC';
    db.query(sql, callback);
  },

  // Lấy danh mục theo ID
  getById: (id, callback) => {
    const sql = 'SELECT * FROM categories WHERE category_id = ?';
    db.query(sql, [id], callback);
  },

  // Lấy danh mục con theo parent_id
  getChildren: (parentId, callback) => {
    const sql = 'SELECT * FROM categories WHERE parent_id = ?';
    db.query(sql, [parentId], callback);
  },

  // Tạo mới danh mục (cha hoặc con)
  create: (data, callback) => {
    const sql = 'INSERT INTO categories (name, parent_id) VALUES (?, ?)';
    db.query(sql, [data.name, data.parent_id || null], callback);
  },

  // Cập nhật danh mục
  update: (id, data, callback) => {
    const sql = 'UPDATE categories SET name = ?, parent_id = ? WHERE category_id = ?';
    db.query(sql, [data.name, data.parent_id || null, id], callback);
  },

  // Xóa danh mục
  delete: (id, callback) => {
    const sql = 'DELETE FROM categories WHERE category_id = ?';
    db.query(sql, [id], callback);
  }
};

  // Kiểm tra danh mục đã tồn tại (theo name và parent_id)
  Category.exists = (name, parent_id, callback) => {
    const sql = 'SELECT category_id FROM categories WHERE name = ? AND (parent_id = ? OR (parent_id IS NULL AND ? IS NULL)) LIMIT 1';
    db.query(sql, [name, parent_id, parent_id], callback);
  };

module.exports = Category;
