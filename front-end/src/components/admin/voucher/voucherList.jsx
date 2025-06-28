"use client";
import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal } from 'react-bootstrap';
import AddVoucherModal from './form/addVoucher';

export default function VoucherList() {
  const [voucherList, setVoucherList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const data = [
      {
        id: 1,
        name: 'Giảm 10%',
        code: 'SALE10',
        createdAt: '2025-06-01',
        startDate: '2025-06-05',
        endDate: '2025-06-30',
        discountType: 'percent',
        discountValue: 10,
      },
    ];
    setVoucherList(data);
  }, []);

  const formatDiscount = (type, value) => {
    return type === 'percent' ? `${value}%` : `${value.toLocaleString()}đ`;
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
            <th>Mã code</th>
            <th>Ngày tạo</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Giảm</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {voucherList.map((voucher, index) => (
            <tr key={voucher.id}>
              <td>{index + 1}</td>
              <td>{voucher.name}</td>
              <td>
                <Badge bg="dark">{voucher.code}</Badge>
              </td>
              <td>{voucher.createdAt}</td>
              <td>{voucher.startDate}</td>
              <td>{voucher.endDate}</td>
              <td>{formatDiscount(voucher.discountType, voucher.discountValue)}</td>
              <td>
                <Button variant="info" size="sm">Xem</Button>
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
