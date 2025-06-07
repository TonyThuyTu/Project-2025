const db = require('../models/index.model');
const Banner = db.Banner;
const path = require('path');

// Lấy tất cả banner
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [['id_banner', 'DESC']] });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách banner', detail: err.message });
  }
};

// Thêm banner
exports.createBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Vui lòng chọn ảnh' });

    // Lưu đường dẫn ảnh để frontend truy cập được
    const imageUrl = `/uploads/${req.file.filename}`;

    const banner = await Banner.create({ banner_img: imageUrl });

    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tạo banner', detail: err.message });
  }
};

// Cập nhật banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);
    if (!banner) return res.status(404).json({ error: 'Không tìm thấy banner' });

    const newImage = req.file ? req.file.filename : banner.banner_img;
    await banner.update({ banner_img: newImage });


    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi cập nhật banner', detail: err.message });
  }
};

// Xóa banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);
    if (!banner) return res.status(404).json({ error: 'Không tìm thấy banner' });

    await banner.destroy();
    res.json({ message: 'Đã xóa banner' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa banner', detail: err.message });
  }
};
