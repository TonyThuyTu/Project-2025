const db = require('../config/db');

const Product = {
  // Lấy tất cả sản phẩm
  getAll: (callback) => {
    const sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.id_products DESC
    `;
    db.query(sql, callback);
  },

  // Lấy sản phẩm theo ID
  getById: (id, callback) => {
    const sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.id_products = ?
    `;
    db.query(sql, [id], callback);
  },

  // Thêm sản phẩm
  create: (productData, callback) => {
    const {
      category_id,
      products_name,
      products_market_price,
      products_sale_price,
      products_description,
      products_status
    } = productData;

    const sql = `
      INSERT INTO products (category_id, products_name, products_market_price, products_sale_price, products_description, products_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [category_id, products_name, products_market_price, products_sale_price, products_description, products_status], callback);
  },

  // Cập nhật sản phẩm
  update: (id, productData, callback) => {
    const {
      category_id,
      products_name,
      products_market_price,
      products_sale_price,
      products_description,
      products_status
    } = productData;

    const sql = `
      UPDATE products
      SET category_id = ?, products_name = ?, products_market_price = ?, products_sale_price = ?, products_description = ?, products_status = ?
      WHERE id_products = ?
    `;
    db.query(sql, [category_id, products_name, products_market_price, products_sale_price, products_description, products_status, id], callback);
  },

  // Xóa sản phẩm (và dữ liệu liên quan)
  delete: (id, callback) => {
    const sql1 = `DELETE FROM product_img WHERE id_products = ?`;
    const sql2 = `DELETE FROM product_spec WHERE id_products = ?`;
    const sql3 = `DELETE FROM products WHERE id_products = ?`;

    db.query(sql1, [id], (err) => {
      if (err) return callback(err);
      db.query(sql2, [id], (err) => {
        if (err) return callback(err);
        db.query(sql3, [id], callback);
      });
    });
  },

  // Thêm thông số sản phẩm
  addSpecs: (productId, specs, callback) => {
    const sql = `INSERT INTO product_spec (id_products, spec_name, spec_value) VALUES ?`;
    const values = specs.map(({ spec_name, spec_value }) => [productId, spec_name, spec_value]);
    db.query(sql, [values], callback);
  },

  // Thêm ảnh sản phẩm
  addImages: (productId, images, callback) => {
    const sql = `INSERT INTO product_img (id_products, product_img_url, is_main) VALUES ?`;
    const values = images.map((file, index) => [productId, `/upload/${file.filename}`, index === 0]);
    db.query(sql, [values], callback);
  },

  // Lấy thông số theo id sản phẩm
  getSpecsByProductId: (productId, callback) => {
    const sql = `SELECT * FROM product_spec WHERE id_products = ?`;
    db.query(sql, [productId], callback);
  },

  // Lấy ảnh theo id sản phẩm
  getImagesByProductId: (productId, callback) => {
    const sql = `SELECT * FROM product_img WHERE id_products = ?`;
    db.query(sql, [productId], callback);
  }
};

module.exports = Product;
