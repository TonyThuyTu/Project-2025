const Banner = require('../models/banner');
const path = require('path');
const fs = require('fs');

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.getAll();
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách banner', error: err.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh banner' });

    const imageUrl = `/uploads/${req.file.filename}`;
    const newBanner = await Banner.create(imageUrl);

    res.status(201).json(newBanner);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi thêm banner', error: err.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh mới' });

    const banner = await Banner.getById(id);
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner' });

    const oldPath = path.join(__dirname, '..', banner.banner_img_url);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    const newUrl = `/uploads/${req.file.filename}`;
    const updatedBanner = await Banner.update(id, newUrl);

    res.json(updatedBanner);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật banner', error: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.getById(id);
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner' });

    const imgPath = path.join(__dirname, '..', banner.banner_img_url);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await Banner.delete(id);
    res.json({ message: 'Xóa banner thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa banner', error: err.message });
  }
};