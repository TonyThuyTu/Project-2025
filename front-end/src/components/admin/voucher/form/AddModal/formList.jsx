import React from 'react';
import { Row, Col, Form, Table } from 'react-bootstrap';

export default function FormList({
  categories,
  selectedParent,
  selectedChild,
  setSelectedParent,
  setSelectedChild,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  selectedProducts,
  handleSelectProduct,
  getImageUrl,
  formatVND
}) {
  return (
    <>
      <h5>Chọn sản phẩm áp dụng</h5>
      <Row className="mb-2">
        <Col md={4}>
          <Form.Select
            value={selectedParent}
            onChange={(e) => {
              const parentId = e.target.value;
              setSelectedParent(parentId);
              setSelectedChild('');
            }}
          >
            <option value="">-- Danh mục cha --</option>
            {categories
              .filter((cat) => cat.parent_id === null)
              .map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            disabled={!selectedParent}
          >
            <option value="">-- Danh mục con --</option>
            {categories
              .filter((cat) => cat.parent_id === parseInt(selectedParent))
              .map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
        <Table bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>Chọn</th>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product.products_id}
                  className={selectedProducts.includes(product.products_id) ? 'table-success' : ''}
                >
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedProducts.includes(product.products_id)}
                      onChange={() => handleSelectProduct(product.products_id)}
                    />
                  </td>
                  <td>
                    <img
                      src={getImageUrl(product.main_image_url)}
                      alt={product.products_name}
                      width="50"
                      height="50"
                      style={{ objectFit: 'cover' }}
                    />
                  </td>
                  <td>{product.products_name}</td>
                  <td>{formatVND(product.sale_price)} VNĐ</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  Không tìm thấy sản phẩm phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
