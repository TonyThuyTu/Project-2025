const { Contact } = require('../models/index.model');

// Thêm liên hệ
exports.createContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ message: "Liên hệ đã được gửi!", id_contact: contact.id_contact });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi tạo liên hệ", detail: err.message });
  }
};

// Lấy tất cả liên hệ
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({ order: [['id_contact', 'DESC']] });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách liên hệ", detail: err.message });
  }
};

// Lấy liên hệ theo ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: "Không tìm thấy liên hệ" });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy liên hệ", detail: err.message });
  }
};
