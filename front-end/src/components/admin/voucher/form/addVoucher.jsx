import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';

export default function AddVoucherModal({ show, handleClose }) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_value: '',
    user_limit: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    status: 1,
  });

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');

  // Format tiền (VND)
  const formatVND = (num) => {
    if (num === '' || num == null) return '';
    const str = num.toString();
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Loại bỏ dấu '.' khỏi chuỗi tiền
  const parseVND = (str) => {
    if (!str) return '';
    return str.replace(/\./g, '');
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'discount_type') {
      setForm((prev) => ({
        ...prev,
        discount_type: value,
        discount_value: '',
      }));
      return;
    }

    if (['discount_value', 'min_order_value'].includes(name)) {
      if (form.discount_type === 'fixed') {
        const onlyNums = parseVND(value);
        if (onlyNums === '' || /^[0-9]*$/.test(onlyNums)) {
          setForm((prev) => ({ ...prev, [name]: onlyNums }));
        }
        return;
      } else {
        if (value === '' || /^[0-9]*$/.test(value)) {
          setForm((prev) => ({ ...prev, [name]: value }));
        }
        return;
      }
    }

    if (['user_limit', 'usage_limit'].includes(name)) {
      if (value === '' || /^[0-9]*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Chọn/ bỏ chọn sản phẩm
  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit form
  const handleSubmit = () => {
    const payload = {
      ...form,
      discount_value:
        form.discount_type === 'fixed'
          ? form.discount_value
            ? parseFloat(form.discount_value) / 1_000_000
            : 0
          : form.discount_value
          ? parseFloat(form.discount_value)
          : 0,
      min_order_value: form.min_order_value
        ? parseFloat(form.min_order_value) / 1_000_000
        : null,
      user_limit: form.user_limit ? parseInt(form.user_limit) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      status: 1,
      product_ids: selectedProducts,
    };

    console.log('🎯 Voucher gửi backend:', payload);
    // TODO: Gọi API tạo voucher
    handleClose();
  };

  // Lấy danh mục cha-con
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/categories')
      .then((res) => {
        const flattenCategories = [];

        const traverse = (node) => {
          flattenCategories.push({
            category_id: node.category_id,
            name: node.name,
            parent_id: node.parent_id,
          });

          if (node.children && node.children.length > 0) {
            node.children.forEach(traverse);
          }
        };

        res.data.forEach(traverse);
        setCategories(flattenCategories);
      })
      .catch((err) => console.error('Lỗi lấy danh mục:', err));
  }, []);


  // Lấy sản phẩm theo filter searchTerm, danh mục con
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {
          search: searchTerm || undefined,
          category_id: selectedChild ? parseInt(selectedChild) : undefined, // đảm bảo là số
          parent_id: !selectedChild && selectedParent ? parseInt(selectedParent) : undefined
        };

        const res = await axios.get('http://localhost:5000/api/products', {
          params,
        });
        console.log("🔥 Products received:", res.data); // <-- dòng này
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedChild]);

  const getImageUrl = (path) => {
    if (!path) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCRRdvpS3KRcG9a43mI5-vbU2kysPylGtfHw&s';
    // Nếu path đã là URL (bắt đầu bằng http), dùng luôn
    if (path.startsWith('http')) return path;
    // Ngược lại, prefix host
    return `http://localhost:5000${path}`;
  };

  // Lọc sản phẩm ở client theo searchTerm + danh mục con
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.products_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedChild) {
      filtered = filtered.filter(
        (product) => product.category_id === parseInt(selectedChild)
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedChild, products]);

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thêm Mã Giảm Giá</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Thông tin voucher */}
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
                <Form.Label>Mã code</Form.Label>
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
                  value={
                    form.discount_type === 'fixed'
                      ? formatVND(form.discount_value)
                      : form.discount_value
                  }
                  onChange={handleChange}
                  placeholder={form.discount_type === 'fixed' ? 'VNĐ' : '%'}
                />
                <Form.Text>
                  {form.discount_type === 'fixed' ? 'VNĐ' : '%'}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Đơn hàng tối thiểu</Form.Label>
                <Form.Control
                  type="text"
                  name="min_order_value"
                  value={formatVND(form.min_order_value)}
                  onChange={handleChange}
                />
                <Form.Text>VNĐ</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Số lượt mỗi người</Form.Label>
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
                <Form.Label>Tổng lượt sử dụng</Form.Label>
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
                />
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

          {/* Chọn sản phẩm áp dụng */}
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

          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '5px',
            }}
          >
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
                      className={
                        selectedProducts.includes(product.products_id)
                          ? 'table-success'
                          : ''
                      }
                    >
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedProducts.includes(product.products_id)}
                          onChange={() =>
                            handleSelectProduct(product.products_id)
                          }
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

          <Form.Control type="hidden" name="status" value={form.status} readOnly />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        <Button variant="success" onClick={handleSubmit}>
          Lưu
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
