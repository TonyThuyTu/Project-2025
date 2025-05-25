const db = require('../config/db');

const Contact = {
  // Thêm liên hệ
  create: async ({ name, phone, email, note }) => {
    const [result] = await db
      .promise()
      .execute(
        "INSERT INTO contact (name, phone, email, note) VALUES (?, ?, ?, ?)",
        [name, phone, email, note]
      );
    return result.insertId;
  },

  // Lấy tất cả liên hệ
  getAll: async () => {
    const [rows] = await db.promise().query("SELECT * FROM contact ORDER BY id_contact DESC");
    return rows;
  },

  // Lấy theo ID
  getById: async (id) => {
    const [[row]] = await db
      .promise()
      .execute("SELECT * FROM contact WHERE id_contact = ?", [id]);
    return row;
  },
};

module.exports = Contact;