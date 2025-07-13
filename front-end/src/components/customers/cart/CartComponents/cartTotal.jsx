import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";

const formatVND = (value) =>
  Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function CartTotal({ items }) {
  const [discountCode, setDiscountCode] = useState("");

  const total = items.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.quantity);
  }, 0);

  const handleApplyDiscount = () => {
    alert(`Áp dụng mã giảm giá: ${discountCode} (chưa có xử lý thật)`);
  };

  return (
    <Card className="p-3 shadow-sm">
      <h5 className="mb-3">Tạm tính</h5>
      <Form.Group controlId="discountCode">
        <Form.Label>Nhập mã giảm giá</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nhập mã..."
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
        />
      </Form.Group>
      <Button
        variant="success"
        className="mt-2 w-100"
        onClick={handleApplyDiscount}
        disabled={!discountCode.trim()}
      >
        Áp dụng mã
      </Button>

      <hr />

      <div className="d-flex justify-content-between fw-bold fs-5">
        <span>Tổng tiền:</span>
        <span>{formatVND(total)}</span>
      </div>
      <Button
        variant="success"
        className="mt-2 w-100"
        // onClick={}
        // disabled={}
      >
        Thanh toán
      </Button>
    </Card>
  );
}
