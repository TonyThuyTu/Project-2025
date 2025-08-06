"use client";
import { Form, Card } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function CheckoutInfo({
  userInfo,
  setUserInfo,
  addresses = [],
  selectedAddress,
  setSelectedAddress,
  paymentMethod,
  setPaymentMethod,
}) {
  
  const [newAddress, setNewAddress] = useState({
    address: "",
    ward: "",
    city: "",
  });

  // ✅ Hàm cập nhật userInfo
  const handleChangeUser = (field, value) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Hàm cập nhật địa chỉ mới
  const handleChangeNewAddress = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Tự động chọn địa chỉ mặc định nếu chưa chọn
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const primary = addresses.find((a) => a.is_primary === 1);
      setSelectedAddress(primary || addresses[0]);
    }
  }, [addresses, selectedAddress, setSelectedAddress]);

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
  };

  return (
    <div>
      {/* === Thông tin khách hàng === */}
      {userInfo && (
        <div>
          <h5>Thông tin khách hàng</h5>

          <div className="mb-2">
            <label className="form-label">Họ và tên</label>
            <input
              type="text"
              className="form-control"
              value={userInfo.name || ""}
              onChange={(e) => handleChangeUser("name", e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={userInfo.email || ""}
              onChange={(e) => handleChangeUser("email", e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Số điện thoại</label>
            <input
              type="tel"
              className="form-control"
              value={userInfo.phone || ""}
              onChange={(e) => handleChangeUser("phone", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* === Địa chỉ giao hàng === */}
      <h5>Thông tin giao hàng</h5>

      {addresses.length > 0 ? (
        <div className="d-flex flex-column gap-2">
          {addresses.map((addr) => (
            <Card
              key={addr.id_address}
              onClick={() => handleSelectAddress(addr)}
              style={{
                cursor: "pointer",
                border:
                  selectedAddress?.id_address === addr.id_address
                    ? "2px solid #007bff"
                    : "1px solid #ccc",
                background:
                  selectedAddress?.id_address === addr.id_address
                    ? "#e9f5ff"
                    : "#fff",
              }}
              className="p-3"
            >
              <div>
                <strong>
                  {addr.address_label}
                  {addr.is_primary === true && (
                    <span
                      className="text-primary bg-light ms-2 px-2 py-1 rounded"
                      style={{ fontSize: "15px", fontWeight: 500 }}
                    >
                      Mặc định
                    </span>
                  )}
                </strong>
              </div>
              <div>
                {addr.name_city} - {addr.name_ward} - {addr.name_address}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Form.Group className="mb-2">
            <Form.Label>Địa chỉ</Form.Label>
            <Form.Control
              name="address"
              value={newAddress.address}
              onChange={handleChangeNewAddress}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Phường</Form.Label>
            <Form.Control
              name="ward"
              value={newAddress.ward}
              onChange={handleChangeNewAddress}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Thành phố</Form.Label>
            <Form.Control
              name="city"
              value={newAddress.city}
              onChange={handleChangeNewAddress}
            />
          </Form.Group>
        </div>
      )}

      {/* === Phương thức thanh toán === */}
      <h5 className="mt-4">Phương thức thanh toán</h5>

      <Form.Check
        type="radio"
        label="Thanh toán khi nhận hàng (COD)"
        name="payment"
        value={1}
        checked={paymentMethod === 1}
        onChange={() => setPaymentMethod(1)}
      />
      <Form.Check
        type="radio"
        label="Thanh toán online"
        name="payment"
        value={2}
        checked={paymentMethod === 2}
        onChange={() => setPaymentMethod(2)}
      />
    </div>
  );
}
