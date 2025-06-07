"use client";

import { useState, useEffect } from "react";
import axios from "axios";

function ViewContactModal({ contactId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contactId) {
      setDetail(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/contact/${contactId}`);
        setDetail(res.data);
      } catch (error) {
        console.error(error);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [contactId]);

  if (!contactId) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "block" }}
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
              </>
            )}
            {!loading && !detail && <p>Không tìm thấy dữ liệu.</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/contact");
        setContacts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="container p-3">
      <h2>Danh sách liên hệ</h2>
      <table className="table table-bordered table-hover mt-3">
        <thead className="table-secondary">
          <tr>
            <th>Tên</th>
            <th>Số điện thoại</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">
                Không có liên hệ nào.
              </td>
            </tr>
          ) : (
            contacts.map((contact) => (
              <tr key={contact.id_contact}>
                <td>{contact.name}</td>
                <td>{contact.phone}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedContactId(contact.id_contact)}
                  >
                    Xem thêm
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ViewContactModal
        contactId={selectedContactId}
        onClose={() => setSelectedContactId(null)}
      />
    </div>
  );
}
