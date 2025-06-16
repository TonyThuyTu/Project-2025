"use client";
import React, { useEffect, useState } from "react";
import ReviewDetailModal from "./form/reviewsModalDetail";
import axios from "axios";

export default function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [filterStatus, setFilterStatus] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/reviews"); // sửa URL đúng backend bạn nhé
      setReviews(res.data);
    } catch (err) {
      setError("Lỗi khi tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

    const openDetailModal = async (reviewSummary) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reviews/${reviewSummary.id_review}`);
            setSelectedReview(res.data);
            setShowDetailModal(true);
        } catch {
            alert("Lỗi tải chi tiết bình luận");
        }
    };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReview(null);
  };

  // Callback khi modal cập nhật trạng thái duyệt
  const handleReviewUpdated = () => {
    fetchReviews(); // tải lại danh sách sau khi duyệt
  };

    const filteredReviews = reviews.filter((r) => {
        if (!filterStatus || filterStatus === "") return true; // hiển thị tất cả
        return r.approved === filterStatus;
    });

  return (
    <div className="container mt-3">
      <h2>Quản lý Bình luận Sản phẩm</h2>

        <div className="mb-3">
        <label htmlFor="filterStatus" className="form-label">
          Lọc theo trạng thái
        </label>
        <select
          id="filterStatus"
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="Pending">Chờ duyệt</option>
          <option value="Approved">Đã duyệt</option>
          <option value="Rejected">Từ chối</option>
        </select>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <>
          <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                    <th>Tiêu đề</th>
                    <th>Đánh giá</th>
                    <th>Ngày</th>
                    <th>Sản phẩm</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredReviews.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="text-center">
                        Không có bình luận nào
                        </td>
                    </tr>
                    ) : (
                    filteredReviews.map((r) => (
                        <tr key={r.id_review}>
                        <td>{r.title || "(Không có tiêu đề)"}</td>
                        <td>{r.rating} ⭐</td>
                        <td>{new Date(r.date).toLocaleString()}</td>
                        <td>{r.product?.products_name || "N/A"}</td>
                        <td>
                            {r.approved === "Pending" && (
                            <span className="badge bg-warning text-dark">Chờ duyệt</span>
                            )}
                            {r.approved === "Approved" && (
                            <span className="badge bg-success">Đã duyệt</span>
                            )}
                            {r.approved === "Rejected" && (
                            <span className="badge bg-danger">Từ chối</span>
                            )}
                        </td>
                        <td>
                            <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openDetailModal(r)}
                            >
                            Chi tiết
                            </button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
          <ReviewDetailModal
            show={showDetailModal}
            onClose={closeDetailModal}
            review={selectedReview}
            onUpdated={handleReviewUpdated} // callback để reload danh sách
          />
        </>
      )}
    </div>
  );
}
