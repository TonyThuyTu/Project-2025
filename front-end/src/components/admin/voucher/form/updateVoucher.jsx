import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FormAdd from './UpdateModal/formAdd';
import FormList from './UpdateModal/formList';
import axios from 'axios';

export default function EditVoucherModal({ show, handleClose, voucherId, onSuccess }) {
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
    usage_count: '',
    end_date: '',
    status: 1,
  });

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const parseVND = (str) => {
    if (!str) return '';
    return str.replace(/[^\d]/g, '');
  };

  const formatVND = (num) => {
    const number = typeof num === 'string' ? parseInt(num) : num;
    if (isNaN(number)) return '';
    return number.toLocaleString('vi-VN') + ' đ';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'discount_type') {
      setForm((prev) => ({ 
        ...prev, 
        discount_type: value, 
        discount_value: '' ,
      }));
      return;
    }

    if (name === 'discount_value') {
      const raw = parseVND(value);
      if (form.discount_type === 'fixed') {
        if (raw === '' || /^[0-9]+$/.test(raw)) {
          setForm((prev) => ({ ...prev, discount_value: raw }));
        }
      } else {
        if (raw === '' || (/^\d{1,3}$/.test(raw) && parseInt(raw) <= 100)) {
          setForm((prev) => ({ ...prev, discount_value: raw }));
        }
      }
      return;
    }

    if (name === 'min_order_value') {
      const raw = parseVND(value);
      if (raw === '' || /^[0-9]+$/.test(raw)) {
        setForm((prev) => ({ ...prev, min_order_value: raw }));
      }
      return;
    }

    if (['user_limit', 'usage_limit'].includes(name)) {
      if (value === '' || /^[0-9]*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === 'status') {
      setForm((prev) => ({ ...prev, status: parseInt(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getAllChildCategoryIds = (parentId) => {
    const result = [];
    const traverse = (id) => {
      result.push(id);
      const children = categories.filter((cat) => cat.parent_id === id);
      children.forEach((child) => traverse(child.category_id));
    };
    traverse(parseInt(parentId));
    return result;
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCRRdvpS3KRcG9a43mI5-vbU2kysPylGtfHw&s';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const fetchVoucherDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/voucher/${voucherId}`);
      const data = res.data;

      setForm({
        name: data.name,
        code: data.code,
        description: data.description,
        discount_type: data.discount_type,
        discount_value: data.discount_value?.toString() || '',
        min_order_value: data.min_order_value?.toString() || '',
        user_limit: data.user_limit?.toString() || '',
        usage_limit: data.usage_limit?.toString() || '',
        start_date: data.start_date?.slice(0, 16) || '',
        end_date: data.end_date?.slice(0, 16) || '',
        status: data.status,
        usage_count: data.usage_count,
      });

      setSelectedProducts(data.products.map((p) => p.id_products));
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết voucher:', err);
    }
  };

  const validateForm = () => {
    if (!form.name?.trim()) return 'Tên voucher không được để trống';
    if (!form.code?.trim()) return 'Mã voucher không được để trống';

    const discountVal = parseFloat(form.discount_value);
    if (isNaN(discountVal)) return 'Giá trị giảm không hợp lệ';

    if (form.discount_type === 'percent') {
      if (discountVal < 0 || discountVal > 100) return 'Giá trị phần trăm phải nằm trong khoảng 0 - 100';
    }

    if (!form.start_date || !form.end_date) return 'Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc';

    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    if (start > end) return 'Ngày kết thúc phải sau ngày bắt đầu';

    return null;
  };

  const handleUpdate = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(`⚠️ ${validationError}`);
      return;
    }

    try {
      const payload = {
        ...form,
        discount_value: form.discount_value ? parseFloat(form.discount_value) : 0,
        min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : null,
        user_limit: form.user_limit ? parseInt(form.user_limit) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        productIds: selectedProducts,
      };

      await axios.put(`http://localhost:5000/api/voucher/${voucherId}`, payload);

      alert('🎉 Cập nhật voucher thành công!');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      const message = err?.response?.data?.message || '';
      if (err?.response?.status === 400 && message.includes('tồn tại')) {
        alert(`⚠️ ${message}`);
      } else {
        alert('❌ Cập nhật thất bại, vui lòng thử lại sau!');
      }
    }
  };

  useEffect(() => {
    if (show && voucherId) fetchVoucherDetail();
  }, [show, voucherId]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/categories')
      .then((res) => {
        const flatten = [];
        const traverse = (node) => {
          flatten.push({ category_id: node.category_id, name: node.name, parent_id: node.parent_id });
          node.children?.forEach(traverse);
        };
        res.data.forEach(traverse);
        setCategories(flatten);
      })
      .catch((err) => console.error('Lỗi lấy danh mục:', err));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let categoryIds = [];
        if (selectedChild) {
          categoryIds = [parseInt(selectedChild)];
        } else if (selectedParent) {
          categoryIds = getAllChildCategoryIds(selectedParent);
        }

        const res = await axios.get('http://localhost:5000/api/products', {
          params: {
            search: searchTerm || undefined,
            category_ids: categoryIds.length > 0 ? categoryIds : undefined,
          },
        });

        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedChild, selectedParent, categories]);

  useEffect(() => {
    let filtered = [...products];
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.products_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedChild) {
      filtered = filtered.filter((p) => p.category_id === parseInt(selectedChild));
    }
    setFilteredProducts(filtered);
  }, [searchTerm, selectedChild, products]);

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Cập nhật Mã Giảm Giá</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <FormAdd form={form} handleChange={handleChange} formatVND={formatVND} />
          <FormList
            categories={categories}
            selectedParent={selectedParent}
            setSelectedParent={setSelectedParent}
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredProducts={filteredProducts}
            selectedProducts={selectedProducts}
            handleSelectProduct={handleSelectProduct}
            getImageUrl={getImageUrl}
            formatVND={formatVND}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Hủy</Button>
        <Button variant="primary" onClick={handleUpdate}>Cập nhật</Button>
      </Modal.Footer>
    </Modal>
  );
}
