"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Badge } from "react-bootstrap";
import axios from "axios";
import AddVoucherModal from "./form/addVoucher";

export default function VoucherList() {
  const [voucherList, setVoucherList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Gọi API để lấy danh sách voucher
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/voucher");
        setVoucherList(res.data.vouchers || []);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách voucher:", err);
      }
    };

    fetchVouchers();
  }, []);

  // Format ngày dạng yyyy-mm-dd
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // Format giảm giá: % hoặc số tiền
  const formatDiscount = (type, value) => {
    return type === "percent"
      ? `${value}%`
      : `${Number(value).toLocaleString("vi-VN")}đ`;
  };

  // Format trạng thái từ status (1: chờ duyệt, 2: hoạt động, 3: ẩn...)
  const formatStatus = (status) => {
    switch (status) {
      case 1:
        return <Badge bg="warning">Chờ duyệt</Badge>;
      case 2:
        return <Badge bg="success">Hoạt động</Badge>;
      case 3:
        return <Badge bg="secondary">Đã ẩn</Badge>;
      default:
        return <Badge bg="dark">Không xác định</Badge>;
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách Mã Giảm Giá</h2>
        <Button onClick={() => setShowAddModal(true)} variant="primary">
          Tạo mã voucher
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Tên mã</th>
            <th>Mã giảm giá</th>
            <th>Ngày tạo</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Giảm</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {voucherList.map((voucher, index) => (
            <tr key={voucher.id_voucher}>
              <td>{index + 1}</td>
              <td>{voucher.name}</td>
              <td>
                <Badge bg="primary">{voucher.code}</Badge>
              </td>
              <td>{formatDate(voucher.create_date)}</td>
              <td>{formatDate(voucher.start_date)}</td>
              <td>{formatDate(voucher.end_date)}</td>
              <td>{formatDiscount(voucher.discount_type, voucher.discount_value)}</td>
              <td>{formatStatus(voucher.status)}</td>
              <td>
                <Button variant="info" size="sm">
                  Xem
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal thêm mới */}
      <AddVoucherModal show={showAddModal} handleClose={() => setShowAddModal(false)} />
    </div>
  );
}
