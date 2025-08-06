"use client";
import { Form, Button } from "react-bootstrap";
import { useState } from "react";

export default function CheckoutInfo({
  addresses,
  selectedAddress,
  setSelectedAddress,
  paymentMethod,
  setPaymentMethod,
}) {
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const handleSelectAddress = (id) => {
    const addr = addresses.find((a) => a.id === id);
    setSelectedAddress(addr);
  };

  const handleChangeNewAddress = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h5>Thông tin giao hàng</h5>
      {addresses.length > 0 ? (
        <Form.Group className="mb-3">
          <Form.Label>Chọn địa chỉ</Form.Label>
          <Form.Select
            value={selectedAddress?.id || ""}
            onChange={(e) => handleSelectAddress(Number(e.target.value))}
          >
            <option value="">-- Chọn địa chỉ --</option>
            {addresses.map((addr) => (
              <option key={addr.id_address} value={addr.id_address}>
                {addr.address_label} - {addr.name_city} - {addr.name_ward} - {addr.name_address}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      ) : (
        <div>
          <h6>Nhập địa chỉ mới</h6>
          <Form.Group className="mb-2">
            <Form.Label>Tên người nhận</Form.Label>
            <Form.Control
              name="name"
              value={newAddress.name}
              onChange={handleChangeNewAddress}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              name="phone"
              value={newAddress.phone}
              onChange={handleChangeNewAddress}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Địa chỉ</Form.Label>
            <Form.Control
              name="address"
              value={newAddress.address}
              onChange={handleChangeNewAddress}
            />
          </Form.Group>
        </div>
      )}

      <h5 className="mt-4">Phương thức thanh toán</h5>
      <Form.Check
        type="radio"
        label="Thanh toán khi nhận hàng (COD)"
        name="payment"
        checked={paymentMethod === "cod"}
        onChange={() => setPaymentMethod("cod")}
      />
      <Form.Check
        type="radio"
        label="Thanh toán online"
        name="payment"
        checked={paymentMethod === "online"}
        onChange={() => setPaymentMethod("online")}
      />

      <Button className="mt-3" variant="primary">
        Xác nhận đơn hàng
      </Button>
    </div>
  );
}
