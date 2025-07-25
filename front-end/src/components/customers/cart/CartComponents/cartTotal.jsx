import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const formatVND = (value) =>
  Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function CartTotal({ items, onShowContactModal }) {
  const [discountCode, setDiscountCode] = useState("");
  const [voucherInfo, setVoucherInfo] = useState(null);

  const totalBeforeDiscount = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const applyVoucher = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/voucher/apply", {
        code: discountCode,
        total: totalBeforeDiscount,
        productIds: items.map((item) => item.id_product),
      });

      setVoucherInfo(res.data.voucher);
      toast.success("Áp dụng mã giảm giá thành công!");
    } catch (err) {
      setVoucherInfo(null);
      toast.error(err.response?.data?.message || "Mã giảm giá không hợp lệ!");
    }
  };

  const calculateFinalTotal = () => {
    if (!voucherInfo) return totalBeforeDiscount;
    return voucherInfo.discount_type === "percent"
      ? totalBeforeDiscount * (1 - voucherInfo.discount_value / 100)
      : totalBeforeDiscount - voucherInfo.discount_value;
  };

  const handleCheckout = () => {
    const hasLargeQuantity = items.some(item => Number(item.quantity) >= 10);
    if (hasLargeQuantity) {
      onShowContactModal();
    } else {
      window.location.href = "/checkout";
    }
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
        <Button
          variant="success"
          className="mt-2 w-100"
          onClick={applyVoucher}
          disabled={!discountCode.trim()}
        >
          Áp dụng mã
        </Button>
      </Form.Group>

      {voucherInfo && (
        <div className="mt-2 text-success">
          ✅ Mã: <strong>{voucherInfo.code}</strong> - Giảm{" "}
          {voucherInfo.discount_type === "percent"
            ? `${voucherInfo.discount_value}%`
            : formatVND(voucherInfo.discount_value)}
        </div>
      )}

      <hr />

      <div className="d-flex justify-content-between fw-bold fs-5">
        <span>Tổng tiền:</span>
        <span>{formatVND(calculateFinalTotal())}</span>
      </div>

      <Button
        variant="success"
        className="mt-2 w-100"
        onClick={handleCheckout}
      >
        Thanh toán
      </Button>
    </Card>
  );
}
