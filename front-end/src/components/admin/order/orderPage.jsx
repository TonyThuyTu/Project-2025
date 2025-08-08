"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function OrderPage() {
  // Test data
  const orders = [
    {
      id_order: 1,
      customer_name: "Nguyễn Văn A",
      order_date: "2025-08-05T14:30:00",
      payment_method: 1, // COD
      total_amount: 250000,
      payment_status: 1, // COD luôn chờ
      order_status: 1,
    },
    {
      id_order: 2,
      customer_name: "Trần Thị B",
      order_date: "2025-08-06T09:15:00",
      payment_method: 2, // Online
      total_amount: 1500000,
      payment_status: 2, // Thành công
      order_status: 2,
    },
    {
      id_order: 3,
      customer_name: "Phạm Văn C",
      order_date: "2025-08-07T18:45:00",
      payment_method: 2, // Online
      total_amount: 900000,
      payment_status: 3, // Thất bại
      order_status: 3,
    },
  ];

  const paymentMethodMap = {
    1: "COD",
    2: "Online",
  };

  const paymentStatusMap = {
    1: { text: "Chờ", class: "badge bg-warning text-dark" },
    2: { text: "Thành công", class: "badge bg-success" },
    3: { text: "Thất bại", class: "badge bg-danger" },
  };

  const orderStatusMap = {
    1: { text: "Đang chờ", class: "badge bg-secondary" },
    2: { text: "Xác nhận", class: "badge bg-primary" },
    3: { text: "Hủy", class: "badge bg-dark" },
  };

  const formatVND = (value) =>
    Number(value).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="container py-4">
      <h2 className="mb-4">Danh sách đơn hàng</h2>

      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-secondary">
            <tr>
              <th>Tên người đặt</th>
              <th>Ngày đặt</th>
              <th>Hình thức thanh toán</th>
              <th>Tổng tiền</th>
              <th>Trạng thái thanh toán</th>
              <th>Trạng thái đơn hàng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id_order}>
                <td>{order.customer_name}</td>
                <td>{new Date(order.order_date).toLocaleDateString("vi-VN")}</td>
                <td>{paymentMethodMap[order.payment_method]}</td>
                <td className="fw-bold">{formatVND(order.total_amount)}</td>
                <td>
                  <span
                    className={
                      order.payment_method === 1
                        ? paymentStatusMap[1].class
                        : paymentStatusMap[order.payment_status].class
                    }
                  >
                    {order.payment_method === 1
                      ? paymentStatusMap[1].text
                      : paymentStatusMap[order.payment_status].text}
                  </span>
                </td>
                <td>
                  <span className={orderStatusMap[order.order_status].class}>
                    {orderStatusMap[order.order_status].text}
                  </span>
                </td>
                <td>
                    <button 
                    className="btn btn-sm btn-info fw-bold"
                    >
                        Chi tiết
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
