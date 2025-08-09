'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Modal, Spinner, Pagination, Card } from "react-bootstrap";

export default function OrderList({ idCustomer }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  useEffect(() => {
    if (!idCustomer) return;

    setLoading(true);
    axios
      .get(`http://localhost:5000/api/order/customer/${idCustomer}`)
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error("Lỗi lấy đơn hàng:", err);
        alert("Lỗi lấy danh sách đơn hàng");
      })
      .finally(() => setLoading(false));
  }, [idCustomer]);

  const openModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatPaymentMethod = (method) => {
    switch (method) {
      case 1:
        return "Thanh toán khi nhận hàng (COD)";
      case 2:
        return "Thanh toán Online";
      default:
        return "Khác";
    }
  };

    const formatOrderStatus = (status) => {
        switch (status) {
            case 1:
            return <span className="badge bg-warning text-white">Đang xử lý</span>;
            case 2:
            return <span className="badge bg-success text-white">Đã xác nhận</span>;
            case 3:
            return <span className="badge bg-danger text-white">Đã hủy</span>;
            default:
            return <span className="badge bg-secondary text-white">Khác</span>;
        }
    };



  // Lấy orders hiển thị theo trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Tạo phân trang
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <>
      {loading ? (
        <Spinner animation="border" />
      ) : orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <>
          {currentOrders.map((order) => (
            <Card key={order.id_order} className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title>Đơn hàng #{order.id_order}</Card.Title>
                <Card.Text>
                  <b>Ngày đặt:</b> {formatDate(order.Order_date)} <br />
                  <b>Phương thức thanh toán:</b> {formatPaymentMethod(order.payment_method)} <br />
                  <b>Trạng thái đơn hàng:</b> {formatOrderStatus(order.order_status)} <br />
                  <b>Tổng tiền:</b> {Number(order.total_amount).toLocaleString("vi-VN")} ₫
                </Card.Text>
                <Button variant="primary" size="sm" onClick={() => openModal(order)}>
                  Xem chi tiết
                </Button>
              </Card.Body>
            </Card>
          ))}

          <Pagination>{paginationItems}</Pagination>
        </>
      )}

      {/* Modal chi tiết đơn hàng */}
      <Modal show={showModal} onHide={closeModal} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng #{selectedOrder?.id_order}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder ? (
            <>
              <p>
                <b>Ngày đặt:</b> {formatDate(selectedOrder.Order_date)}
              </p>
              <p>
                <b>Phương thức thanh toán:</b> {formatPaymentMethod(selectedOrder.payment_method)}
              </p>
              <p>
                <b>Trạng thái đơn hàng:</b> {formatOrderStatus(selectedOrder.order_status)}
              </p>
              <p>
                <b>Tổng tiền:</b> {Number(selectedOrder.total_amount).toLocaleString("vi-VN")} ₫
              </p>
              {/* Nếu có thêm dữ liệu chi tiết sản phẩm bạn có thể hiển thị thêm ở đây */}
            </>
          ) : (
            <p>Đang tải chi tiết...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
