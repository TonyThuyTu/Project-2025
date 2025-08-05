"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import BannerModal from "./bannerModal/add"; // Đường dẫn đúng với file của bạn nhé
import { Toast } from "bootstrap";
import { toast } from "react-toastify";

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState(null);

  const fetchBanners = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/banner");
      setBanners(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách banner:", error);
    }
  };

  const togglePrimary = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/banner/toggle/${id}`);
      toast.success("Cập nhật ghim thành công");
      fetchBanners(); // cập nhật lại danh sách sau khi toggle
    } catch (error) {
      console.error("Lỗi toggle ghim:", error);
      toast.error("Không thể ghim banner");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddClick = () => {
    setEditId(null);
    setEditImageUrl(null);
    setShowModal(true);
  };

  const handleEditClick = (banner) => {
    setEditId(banner.id_banner);
    setEditImageUrl(banner.banner_img_url);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (selectedFile) => {
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      if (editId) {
        // Update banner
        await axios.put(`http://localhost:5000/api/banner/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // alert("Cập nhật banner thành công");
        toast.success('Cập nhật thành công!');
      } else {
        // Create banner
        await axios.post("http://localhost:5000/api/banner", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // alert("Thêm banner thành công");
        toast.success('Thêm thành công!');
      }
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật banner:", error);
      // alert("Có lỗi xảy ra");
      toast.error('Có lỗi xảy ra!');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/banner/${id}`);
      // alert("Xóa banner thành công");
      toast.success('Xóa thành công!');
      fetchBanners();
    } catch (error) {
      console.error("Lỗi khi xóa banner:", error);
      alert("Có lỗi khi xóa banner");
    }
  };

  return (
    <div className="container p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách Banner</h2>
        <button className="btn btn-primary" onClick={handleAddClick}>
          Thêm Banner
        </button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-secondary">
          <tr>
            <th>Ảnh Banner</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {banners.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-center">
                Không có banner nào.
              </td>
            </tr>
          ) : (
            banners.map((banner) => (
              <tr key={banner.id_banner}>
                <td>
                  <img
                    src={`http://localhost:5000/uploads/${banner.banner_img}`}
                    alt="Banner"
                    style={{ width: 200, height: 100, objectFit: "cover" }}
                    />
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEditClick(banner)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteBanner(banner.id_banner)}
                  >
                    Xóa
                  </button>
                  {banner.is_primary === 1 ? (
                    <button
                      className="btn btn-success btn-sm me-2 ms-2"
                      onClick={() => togglePrimary(banner.id_banner)}
                    >
                      Bỏ ghim
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-primary btn-sm me-2 ms-2"
                      disabled={banners.some(b => b.is_primary === 1)} // Disable nếu đã có banner khác được ghim
                      onClick={() => togglePrimary(banner.id_banner)}
                    >
                      Ghim
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <BannerModal
        show={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialImageUrl={editImageUrl}
        isEdit={Boolean(editId)}
      />
    </div>
  );
}
