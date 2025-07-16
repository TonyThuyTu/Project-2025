import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FormAdd from './UpdateModal/formAdd';
import FormList from './UpdateModal/formList';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function EditVoucherModal({ show, handleClose, voucherId, onSuccess }) {
  const [form, setForm] = useState(initialFormState());
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [appliedProductCount, setAppliedProductCount] = useState(0);

  const toastId = "update-quantity-toast";

  function initialFormState() {
    return {
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
      usage_count: '',
    };
  }

  const formatVND = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
  const parseVND = (str) => (str ? str.replace(/\./g, '') : '');

  // const formatVND = (num) => {
  //   const number = typeof num === 'string' ? parseInt(num) : num;
  //   if (isNaN(number)) return '';
  //   return number.toLocaleString('vi-VN');
  // };

  const getAllChildCategoryIds = (parentId) => {
    const result = [];
    const traverse = (id) => {
      result.push(id);
      const children = categories.filter((cat) => cat.parent_id === id);
      children.forEach((child) => traverse(child.category_id));
    };
    if (parentId) traverse(parseInt(parentId));
    return result;
  };

  const getImageUrl = (path) => {
    if (!path)
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCRRdvpS3KRcG9a43mI5-vbU2kysPylGtfHw&s';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
      setAppliedProductCount(data.products.length || 0);
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết voucher:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      const flatten = [];
      const traverse = (node) => {
        flatten.push({
          category_id: node.category_id,
          name: node.name,
          parent_id: node.parent_id,
        });
        node.children?.forEach(traverse);
      };
      res.data.forEach(traverse);
      setCategories(flatten);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

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
            page: currentPage,
            limit: 5,
          },
        });

        const { products = [], pagination = {} } = res.data;
        setProducts(products);
        setTotalPages(pagination.totalPages || 1);
      } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedChild, selectedParent, categories, currentPage]);

  useEffect(() => {
    if (show) {
      fetchCategories();
      if (voucherId) fetchVoucherDetail();
      else {
        setForm(initialFormState());
        setSelectedProducts([]);
        setAppliedProductCount(0);
      }
    }
  }, [show, voucherId]);

  const handleChange = (e) => {
      const { name, value } = e.target;
  
      if (name === 'discount_type') {
        return setForm((prev) => ({
          ...prev,
          discount_type: value,
          discount_value: '',
        }));
      }
  
      // Validate giá trị giảm
      if (name === 'discount_value') {
        const isPercent = form.discount_type === 'percent';
  
        if (isPercent) {
          const percentValue = value.replace(/\D/g, '');
          if (/^\d{0,3}$/.test(percentValue) && (+percentValue <= 100 || percentValue === '')) {
            toast.error("Giảm tối thiểu 100%")
            return setForm((prev) => ({
              ...prev,
              discount_value: percentValue,
            
            }));
          }
        } else {
          const onlyNums = parseVND(value);
          const numericValue = parseInt(onlyNums || '0');
  
          if (numericValue > 10000000){
            toast.error("Giảm tối thiểu 10 triệu")
          } // ❌ vượt quá 10 triệu → không cho nhập
  
          if (/^\d*$/.test(onlyNums)) {
            return setForm((prev) => ({
              ...prev,
              discount_value: onlyNums,
            }));
          }
        }
  
        return;
      }
  
      // Validate các giá trị khác
      if (['min_order_value', 'user_limit', 'usage_limit'].includes(name)) {
        const val = parseVND(value);
        const numericValue = parseInt(val || '0');
  
        if (name === 'min_order_value' && numericValue > 50000000) {
          toast.error("Đơn hàng tối thiểu 50 triệu");
        } // ❌ vượt quá 50 triệu
  
        if (/^\d*$/.test(val)) {
          return setForm((prev) => ({
            ...prev,
            [name]: val,
          }));
        }
  
        return;
      }
  
      setForm((prev) => ({ ...prev, [name]: value }));
    };

  const validateForm = () => {
    if (!form.name.trim()) return 'Tên voucher không được để trống';
    if (!form.code.trim()) return 'Mã voucher không được để trống';
    if (!form.start_date || !form.end_date) return 'Vui lòng chọn ngày bắt đầu và kết thúc';
    if (new Date(form.start_date) > new Date(form.end_date))
      return 'Ngày kết thúc phải sau ngày bắt đầu';
    return null;
  };

  const handleUpdate = async () => {
    const errMsg = validateForm();
    if (errMsg) {
      alert(`⚠️ ${errMsg}`);
      return;
    }

    try {
      const payload = {
        ...form,
        discount_value:
          form.discount_type === 'percent'
            ? parseInt(form.discount_value)
            : parseInt(form.discount_value.replace(/\./g, '')),
        min_order_value: form.min_order_value
          ? parseInt(form.min_order_value.replace(/\./g, ''))
          : null,
        user_limit: form.user_limit ? parseInt(form.user_limit) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        productIds: selectedProducts,
      };

      await axios.put(`http://localhost:5000/api/voucher/${voucherId}`, payload);
      toast.success("🎉 Cập nhật voucher thành công!");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      const message = err?.response?.data?.message || '';
      if (err?.response?.status === 400 && message.includes("tồn tại")) {
        alert(`⚠️ ${message}`);
      } else {
        toast.error('❌ Cập nhật thất bại, vui lòng thử lại sau!');
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Cập nhật Mã Giảm Giá</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <FormAdd form={form} handleChange={handleChange} formatVND={formatVND} />
          <div className="mb-3">
            <strong>Số sản phẩm đã áp dụng mã: </strong> {appliedProductCount}
          </div>
          <FormList
            categories={categories}
            selectedParent={selectedParent}
            setSelectedParent={setSelectedParent}
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredProducts={products}
            selectedProducts={selectedProducts}
            handleSelectProduct={handleSelectProduct}
            getImageUrl={getImageUrl}
            formatVND={formatVND}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleUpdate}>
          Cập nhật
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
