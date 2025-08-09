import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

// Format phần trăm: 2 => "2%", 2.5 => "2.50%"
function formatPercent(value) {
  const num = Number(value);
  if (isNaN(num)) return '';
  return Number.isInteger(num) ? `${num}%` : `${num.toFixed(2)}%`;
}

// Format tiền VND
function formatVND(value) {
  const num = Number(value);
  if (isNaN(num)) return '';
  
  const options = num % 1 === 0
    ? { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }
    : { style: 'currency', currency: 'VND', minimumFractionDigits: 2 };

  return num.toLocaleString('vi-VN', options);
}

export default function FormAdd({ form, handleChange }) {
  return (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tên mã</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Mã Voucher</Form.Label>
            <Form.Control
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Loại giảm</Form.Label>
            <Form.Select
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
            >
              <option value="percent">% Phần trăm</option>
              <option value="fixed">Số tiền cố định</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Giá trị giảm</Form.Label>
            <Form.Control
              type="text"
              name="discount_value"
              value={form.discount_value || ''}
              onChange={handleChange}
              placeholder={form.discount_type === 'fixed' ? 'VNĐ' : '%'}
            />
            <Form.Text className="text-muted">
              {form.discount_type === 'fixed'
                ? formatVND(form.discount_value)
                : formatPercent(form.discount_value)}
            </Form.Text>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Đơn hàng giá tối thiểu</Form.Label>
            <Form.Control
              type="text"
              name="min_order_value"
              value={form.min_order_value || ''}
              onChange={handleChange}
              placeholder="VNĐ"
            />
            <Form.Text className="text-muted">{formatVND(form.min_order_value)}</Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Các phần còn lại giữ nguyên như bạn đã làm */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Số lượt dùng mỗi người</Form.Label>
            <Form.Control
              type="number"
              name="user_limit"
              value={form.user_limit}
              onChange={handleChange}
              min={0}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tổng số Voucher</Form.Label>
            <Form.Control
              type="number"
              name="usage_limit"
              value={form.usage_limit}
              onChange={handleChange}
              min={0}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ngày bắt đầu</Form.Label>
            <Form.Control
              type="datetime-local"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ngày kết thúc</Form.Label>
            <Form.Control
              type="datetime-local"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Số lượt đã dùng</Form.Label>
            <Form.Control
              type="text"
              name="usage_count"
              value={form.usage_count}
              disabled
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value={1}>Chờ duyệt</option>
              <option value={2}>Hiển thị</option>
              <option value={3}>Ẩn</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Mô tả</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={form.description}
          onChange={handleChange}
        />
      </Form.Group>
    </>
  );
}
