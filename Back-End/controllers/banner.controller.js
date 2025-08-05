const db = require('../models/index.model');
const Banner = db.Banner;
const path = require('path');

//ghim banner
exports.toggleBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({ message: "Banner không tồn tại" });
    }

    if (banner.is_primary === 1) {
      // Nếu đang ghim → bỏ ghim
      banner.is_primary = 0;
      await banner.save();
      return res.json({ message: "Đã bỏ ghim banner", is_primary: 0 });
    } else {
      // Nếu chưa ghim → bỏ ghim các banner khác và ghim banner này
      await Banner.update({ is_primary: 0 }, { where: { is_primary: 1 } });
      banner.is_primary = 1;
      await banner.save();
      return res.json({ message: "Đã ghim banner thành công", is_primary: 1 });
    }
  } catch (error) {
    console.error("Lỗi khi toggle banner:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy tất cả banner
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [["id_banner", "DESC"]] });

    const bannersWithType = banners.map((banner) => {
      const ext = path.extname(banner.file_path || "").toLowerCase();
      const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      const isVideo = [".mp4", ".webm", ".ogg"].includes(ext);

      let type = "unknown";
      if (isImage) type = "image";
      else if (isVideo) type = "video";

      return {
        ...banner.toJSON(),
        type,
      };
    });

    res.json(bannersWithType);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách banner", detail: err.message });
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
