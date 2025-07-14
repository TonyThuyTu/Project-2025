import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FormAdd from './AddModal/formAdd';
import FormList from './AddModal/formList';
import axios from 'axios';

const defaultForm = {
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
};

export default function AddVoucherModal({ show, handleClose, onSuccess }) {
  const [form, setForm] = useState({ ...defaultForm });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const formatVND = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
  const parseVND = (str) => (str ? str.replace(/\./g, '') : '');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'discount_type') {
      return setForm((prev) => ({ ...prev, discount_type: value, discount_value: '' }));
    }

    if (name === 'discount_value') {
      const isPercent = form.discount_type === 'percent';
      if (isPercent && (/^\d{0,3}$/.test(value) && (+value <= 100 || value === ''))) {
        return setForm((prev) => ({ ...prev, discount_value: value }));
      }
      if (!isPercent) {
        const onlyNums = parseVND(value);
        if (/^\d*$/.test(onlyNums)) {
          return setForm((prev) => ({ ...prev, discount_value: onlyNums }));
        }
      }
      return;
    }

    if (['min_order_value', 'user_limit', 'usage_limit'].includes(name)) {
      const val = parseVND(value);
      if (/^\d*$/.test(val)) {
        return setForm((prev) => ({ ...prev, [name]: val }));
      }
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
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code || !form.discount_value) {
      alert('Vui lòng nhập đầy đủ các trường bắt buộc.');
      return;
    }

    const payload = {
      ...form,
      discount_value: parseFloat(form.discount_value || 0),
      min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : null,
      user_limit: form.user_limit ? parseInt(form.user_limit) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      productIds: selectedProducts,
    };

   try {
      await axios.post('http://localhost:5000/api/voucher', payload);
      alert('🎉 Tạo voucher thành công!');
      setForm({ ...defaultForm });
      setSelectedProducts([]);
      setSearchTerm('');
      setSelectedParent('');
      setSelectedChild('');
      handleClose();
      onSuccess?.();
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        err.message ||
        'Tạo voucher thất bại!';

      alert(`❌ ${errorMessage}`);
      console.error('Lỗi tạo voucher:', err.response?.data, err.response?.status, err.message);
    }

  };

  // Lấy danh mục
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/categories')
      .then((res) => {
        const flat = [];
        const traverse = (node) => {
          flat.push({ category_id: node.category_id, name: node.name, parent_id: node.parent_id });
          node.children?.forEach(traverse);
        };
        res.data.forEach(traverse);
        setCategories(flat);
      })
      .catch((err) => console.error('Lỗi danh mục:', err));
  }, []);

  // Lấy sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let categoryIds = [];
        if (selectedChild) categoryIds = [parseInt(selectedChild)];
        else if (selectedParent) categoryIds = getAllChildCategoryIds(selectedParent);

        const params = {
          search: searchTerm || undefined,
          category_ids: categoryIds.length ? categoryIds : undefined,
        };

        const res = await axios.get('http://localhost:5000/api/products', { params });
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedChild, selectedParent, categories]);

  // Lọc sản phẩm
  // useEffect(() => {
  //   let filtered = [...products];

  //   if (searchTerm) {
  //     filtered = filtered.filter((p) =>
  //       p.products_name.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   }

  //   if (selectedChild) {
  //     filtered = filtered.filter((p) => p.category_id === parseInt(selectedChild));
  //   }

  //   setFilteredProducts(filtered);
  // }, [searchTerm, selectedChild, products]);

  const getImageUrl = (path) => {
    if (!path) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCRRdvpS3KRcG9a43mI5-vbU2kysPylGtfHw&s';
    return path.startsWith('http') ? path : `http://localhost:5000${path}`;
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thêm Mã Giảm Giá</Modal.Title>
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
