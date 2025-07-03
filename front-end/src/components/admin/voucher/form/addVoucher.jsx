import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FormAdd from './AddModal/formAdd';
import FormList from './AddModal/formList';
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

  const formatVND = (num) => {
    if (num === '' || num == null) return '';
    const str = num.toString();
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseVND = (str) => {
    if (!str) return '';
    return str.replace(/\./g, '');
  };

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

  const getAllChildCategoryIds = (parentId) => {
    const result = [];

    const traverse = (id) => {
      result.push(id);
      const children = categories.filter(cat => cat.parent_id === id);
      children.forEach(child => traverse(child.category_id));
    };

    traverse(parseInt(parentId));
    return result; 
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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
    handleClose();
  };

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let categoryIds = [];

        if (selectedChild) {
          categoryIds = [parseInt(selectedChild)];
        } else if (selectedParent) {
          categoryIds = getAllChildCategoryIds(selectedParent); // 💡 lấy danh sách cha + con + cháu
        }

        const params = {
          search: searchTerm || undefined,
          category_ids: categoryIds.length > 0 ? categoryIds : undefined,
        };

        const res = await axios.get('http://localhost:5000/api/products', {
          params,
        });

        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedChild, selectedParent, categories]);


  const getImageUrl = (path) => {
    if (!path) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCRRdvpS3KRcG9a43mI5-vbU2kysPylGtfHw&s';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

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
          <FormAdd
            form={form}
            handleChange={handleChange}
            formatVND={formatVND}
          />
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
