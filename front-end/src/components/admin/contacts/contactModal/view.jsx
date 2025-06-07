"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function ViewContactModal({ contactId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contactId) return; // Không fetch nếu không có ID

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/contact/${contactId}`);
        setDetail(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết liên hệ:", error);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    // Optional: clear detail khi contactId thay đổi hoặc modal đóng
    return () => {
      setDetail(null);
    };
  }, [contactId]);

  // Nếu chưa có detail và không loading thì không hiện modal (hoặc bạn có thể hiện loading)
  if (!detail && !loading) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Chi tiết liên hệ</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {loading && <p>Đang tải...</p>}
            {!loading && detail && (
              <>
                <p><strong>Tên:</strong> {detail.name}</p>
                <p><strong>Email:</strong> {detail.email}</p>
                <p><strong>Số điện thoại:</strong> {detail.phone}</p>
                <p><strong>Lời nhắn:</strong> {detail.message || detail.note || "Không có"}</p>
                {/* Nếu backend có cả message và note thì bạn có thể hiện cả hai */}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
