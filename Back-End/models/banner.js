const db = require('../config/db');

const Banner = {
  getAll: (callback) => {
    const sql = 'SELECT * FROM Banner ORDER BY id_banner DESC';
    db.query(sql, callback);
  },

  getById: (id, callback) => {
    const sql = 'SELECT * FROM Banner WHERE id_banner = ?';
    db.query(sql, [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },

  create: (banner_img_url, callback) => {
    const sql = 'INSERT INTO Banner (banner_img_url) VALUES (?)';
    db.query(sql, [banner_img_url], (err, result) => {
      if (err) return callback(err);
      callback(null, { id_banner: result.insertId, banner_img_url });
    });
  },

  update: (id, banner_img_url, callback) => {
    const sql = 'UPDATE Banner SET banner_img_url = ? WHERE id_banner = ?';
    db.query(sql, [banner_img_url, id], (err) => {
      if (err) return callback(err);
      callback(null, { id_banner: id, banner_img_url });
    });
  },

  delete: (id, callback) => {
    const sql = 'DELETE FROM Banner WHERE id_banner = ?';
    db.query(sql, [id], (err) => {
      if (err) return callback(err);
      callback(null);
    });
  },
};

module.exports = Banner;
