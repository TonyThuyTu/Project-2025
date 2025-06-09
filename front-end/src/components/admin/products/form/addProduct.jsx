"use client";

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const initialOption = { attribute: '', value: '', extra_price: 0 };
const initialSpec = { spec_title: '', spec_name: '', spec_value: '' };

export default function AddProductModal({ onClose, onSave, show, onCategoryChange }) {
    const [productName, setProductName] = useState('');
    const [marketPrice, setMarketPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [description, setDescription] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [options, setOptions] = useState([{ ...initialOption }]);
    const [specs, setSpecs] = useState([{ ...initialSpec }]);
    const [primary, setPrimary] = useState(false);
    const [status, setStatus] = useState(false);
    const [productImages, setProductImages] = useState([]);
    const [skuErrors, setSkuErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [selectedParent, setSelectedParent] = useState('');
    const [selectedChild, setSelectedChild] = useState('');

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
        }
        fetchCategories();
    }, []);

    // Set parent categories
    useEffect(() => {
        setParentCategories(categories.filter(c => !c.parent_id));
    }, [categories]);

    // Update child categories when parent changes
    useEffect(() => {
        if (!selectedParent) {
        setChildCategories([]);
        setSelectedChild('');
        if (onCategoryChange) onCategoryChange(null, null);
        return;
        }
        const children = categories.filter(c => c.parent_id === Number(selectedParent));
        setChildCategories(children);
        setSelectedChild('');
        if (onCategoryChange) onCategoryChange(selectedParent, null);
    }, [selectedParent, categories]);

    // Notify category change for child
    useEffect(() => {
        if (onCategoryChange) onCategoryChange(selectedParent, selectedChild);
    }, [selectedChild]);

    // For ReactQuill client side usage
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Hàm kiểm tra SKU trùng nhau
        const validateSKUs = (options) => {
        const skuCount = {};
        const errors = {};
        options.forEach((opt, idx) => {
            const sku = opt.sku?.trim().toUpperCase() || '';
            if (sku) {
            skuCount[sku] = (skuCount[sku] || 0) + 1;
            }
        });
        options.forEach((opt, idx) => {
            const sku = opt.sku?.trim().toUpperCase() || '';
            if (sku && skuCount[sku] > 1) {
            errors[idx] = 'SKU trùng lặp';
            }
        });
        setSkuErrors(errors);
        return Object.keys(errors).length === 0;
        };

        // Generate SKU mặc định nếu chưa có
    const generateSKU = (index, option) => {
    if (option.sku && option.sku.trim() !== '') {
        return option.sku.toUpperCase();
    }
    const att = option.attribute.trim().replace(/\s+/g, '').toUpperCase() || 'ATT';
    const val = option.value.trim().replace(/\s+/g, '').toUpperCase() || 'VAL';
    return `PRD-${index + 1}-${att}-${val}`;
    };

        // Khi người dùng thay đổi option (biến thể)
    const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    if (field === 'extra_price') {
        newOptions[index][field] = parseFloat(value) || 0;
    } else if (field === 'sku') {
        newOptions[index][field] = value.toUpperCase();
    } else {
        newOptions[index][field] = value;
    }
    setOptions(newOptions);
    validateSKUs(newOptions);
    };

    // Handle product images input
    const handleProductImageChange = (e) => {
        const files = Array.from(e.target.files);
        const filesWithPreview = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        }));
        setProductImages(prev => [...prev, ...filesWithPreview]);
    };

    // Remove a product image
    const removeProductImage = (index) => {
        setProductImages(prev => {
        const newArr = [...prev];
        URL.revokeObjectURL(newArr[index].preview);
        newArr.splice(index, 1);
        return newArr;
        });
    };

    // Handle images for options
    const handleOptionImageChange = (optionIndex, e) => {
        const files = Array.from(e.target.files);
        const filesWithPreview = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        }));

        setOptions(prevOptions => {
        const newOptions = [...prevOptions];
        const currentImages = newOptions[optionIndex].images || [];
        newOptions[optionIndex] = {
            ...newOptions[optionIndex],
            images: [...currentImages, ...filesWithPreview],
        };
        return newOptions;
        });
    };

    // Remove option image
    const removeOptionImage = (optionIndex, imgIndex) => {
        setOptions(prevOptions => {
        const newOptions = [...prevOptions];
        const imgs = newOptions[optionIndex].images || [];
        URL.revokeObjectURL(imgs[imgIndex].preview);
        imgs.splice(imgIndex, 1);
        newOptions[optionIndex] = { ...newOptions[optionIndex], images: imgs };
        return newOptions;
        });
    };



    // ReactQuill config
    const modules = {
        toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
        ],
    };
    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'bullet',
        'link',
        'image',
    ];

    // Add / Remove option
    const addOption = () => setOptions([...options, { ...initialOption }]);
    const removeOption = (index) => {
        if (options.length === 1) return;
        setOptions(options.filter((_, i) => i !== index));
    };

    // Change specs fields
    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    // Add / Remove spec
    const addSpec = () => setSpecs([...specs, { ...initialSpec }]);
    const removeSpec = (index) => {
        if (specs.length === 1) return;
        setSpecs(specs.filter((_, i) => i !== index));
    };

    // Calculate variant price
    const calcVariantPrice = (extra) => {
        const base = parseFloat(salePrice) || 0;
        const extraPrice = parseFloat(extra) || 0;
        return (base + extraPrice).toFixed(2);
    };

    // Khi submit form
    const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('category_id trước khi gửi:', category_id, typeof category_id);

    if (!productName.trim()) return alert('Tên sản phẩm không được để trống');
    if (!marketPrice || !salePrice) return alert('Giá thị trường và giá bán không được để trống');

    // Kiểm tra SKU hợp lệ (không trùng)
    if (!validateSKUs(options)) {
        return alert('Vui lòng sửa lỗi trùng SKU trước khi lưu.');
    }

    const formData = new FormData();

    formData.append('products_name', productName);
    formData.append('products_market_price', marketPrice);
    formData.append('products_sale_price', salePrice);
    formData.append('products_description', description);
    formData.append('products_primary', primary);
    formData.append('products_status', status);
    formData.append('category_parent_id', selectedParent);
    formData.append('category_child_id', selectedChild);

    // Ảnh sản phẩm
    productImages.forEach(({ file }) => {
        formData.append('product_images', file);
    });

    // Tạo variants từ options, sử dụng sku đã nhập hoặc generate
    const variants = options.map((opt, idx) => ({
        sku: generateSKU(idx, opt),
        price: calcVariantPrice(opt.extra_price),
        attribute: opt.attribute,
        value: opt.value,
        extra_price: opt.extra_price,
        quantity: 0,
        status: true,
    }));

    formData.append('product_variants', JSON.stringify(variants));
    formData.append('product_specs', JSON.stringify(specs.filter(s => s.spec_title || s.spec_name || s.spec_value)));

    // Ảnh option
    options.forEach((opt, idx) => {
        if (opt.images && opt.images.length > 0) {
        opt.images.forEach(({ file }) => {
            formData.append(`option_images_${idx}`, file);
        });
        }
    });

    try {

        const res = await axios.post('http://localhost:5000/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Thêm sản phẩm thành công');
        onSave(res.data);
    } catch (error) {
        if (error.response) {
            // Server trả về lỗi, xem nội dung chi tiết
            console.error('Lỗi từ server:', error.response.data);
        } else {
            console.error('Lỗi khác:', error.message);
        }
        console.error('Thêm sản phẩm lỗi', error);
        alert('Có lỗi khi thêm sản phẩm');
    }
    };

  return (
    show && (
      <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Thêm Sản Phẩm</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {/* Tên sản phẩm */}
              <div className="mb-3">
                <label htmlFor="productName" className="form-label">Tên sản phẩm</label>
                <input
                  type="text"
                  className="form-control"
                  id="productName"
                  placeholder="Tên sản phẩm"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>

              {/* Giá thị trường và giá bán */}
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="marketPrice" className="form-label">Giá thị trường</label>
                  <input
                    type="number"
                    className="form-control"
                    id="marketPrice"
                    placeholder="Giá thị trường"
                    value={marketPrice}
                    onChange={(e) => setMarketPrice(e.target.value)}
                    required
                    min="0"
                  />
                </div>
                <div className="col">
                  <label htmlFor="salePrice" className="form-label">Giá bán</label>
                  <input
                    type="number"
                    className="form-control"
                    id="salePrice"
                    placeholder="Giá bán"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Danh mục cha và con */}
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="parentCategory" className="form-label">Danh mục cha</label>
                  <select
                    id="parentCategory"
                    className="form-select"
                    value={selectedParent}
                    onChange={(e) => setSelectedParent(e.target.value)}
                  >
                    <option value="">-- Chọn danh mục cha --</option>
                    {parentCategories.map(pc => (
                      <option key={pc.category_id} value={pc.category_id}>
                        {pc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col">
                  <label htmlFor="childCategory" className="form-label">Danh mục con</label>
                  <select
                    id="childCategory"
                    className="form-select"
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(Number(e.target.value))}
                    disabled={childCategories.length === 0}
                  >
                    <option value="">-- Chọn danh mục con --</option>
                    {childCategories.map(cc => (
                      <option key={cc.category_id} value={cc.category_id}>
                        {cc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mô tả sản phẩm */}
              <div className="mb-3">
                <label className="form-label">Mô tả sản phẩm</label>
                {isClient ? (
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                    modules={modules}
                    formats={formats}
                    style={{ height: '150px', marginBottom: '20px' }}
                  />
                ) : (
                  <textarea
                    className="form-control"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                )}
              </div>

              {/* Ảnh sản phẩm */}
              <div className="mb-3 mt-5">
                <label htmlFor="productImages" className="form-label">Ảnh sản phẩm</label>
                <input
                  type="file"
                  id="productImages"
                  multiple
                  accept="image/*"
                  className="form-control"
                  onChange={handleProductImageChange}
                />
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {productImages.map((img, idx) => (
                    <div key={idx} className="position-relative" style={{ width: 80, height: 80 }}>
                      <img
                        src={img.preview}
                        alt={`Preview ${idx}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeProductImage(idx)}
                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                        style={{ lineHeight: 1, padding: '0 6px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trạng thái, Ghim */}
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="primarySwitch"
                  checked={primary}
                  onChange={(e) => setPrimary(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="primarySwitch">
                  Ghim sản phẩm (Hiển thị trang chủ)
                </label>
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="statusSwitch"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="statusSwitch">
                  Hiển thị sản phẩm
                </label>
              </div>

              {/* Thuộc tính biến thể (Options) */}
              <div className="mb-3">
                <h5>Thuộc tính biến thể</h5>
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-3 mb-3 position-relative"
                    style={{ backgroundColor: '#f9f9f9' }}
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0"
                      onClick={() => removeOption(idx)}
                      disabled={options.length === 1}
                      title="Xóa thuộc tính"
                    >
                      ×
                    </button>
                    <div className="row g-2 align-items-center">
                      <div className="col-md-4">
                        <input
                          type="text"
                          placeholder="Tên thuộc tính (Ví dụ: Màu sắc)"
                          className="form-control"
                          value={opt.attribute}
                          onChange={(e) => handleOptionChange(idx, 'attribute', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          placeholder="Giá trị (Ví dụ: Đỏ)"
                          className="form-control"
                          value={opt.value}
                          onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="text"
                          placeholder="Giá cộng thêm"
                          className="form-control"
                          value={opt.extra_price}
                          onChange={(e) => handleOptionChange(idx, 'extra_price', e.target.value)}
                        />
                      </div>
                      <div className="col-md-1 text-center">
                        <span
                          className="badge bg-secondary"
                          style={{ lineHeight: '2', fontSize: '0.9rem' }}
                          title="Mã SKU"
                        >
                          {generateSKU(idx, opt)}
                        </span>
                      </div>
                    </div>

                    {/* Ảnh cho từng biến thể */}
                    <div className="mt-2">
                      <label className="form-label">Ảnh biến thể</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => handleOptionImageChange(idx, e)}
                      />
                      <div className="mt-2 d-flex flex-wrap gap-2">
                        {(opt.images || []).map((img, i) => (
                          <div
                            key={i}
                            className="position-relative"
                            style={{ width: 60, height: 60 }}
                          >
                            <img
                              src={img.preview}
                              alt={`Option Img ${i}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <button
                              type="button"
                              onClick={() => removeOptionImage(idx, i)}
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{ lineHeight: 1, padding: '0 6px' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addOption}
                >
                  + Thêm thuộc tính
                </button>
              </div>

              {/* Thông số kỹ thuật */}
              <div className="mb-3">
                <h5>Thông số kỹ thuật</h5>
                {specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="border rounded p-3 mb-3 position-relative"
                    style={{ backgroundColor: '#fefefe' }}
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0"
                      onClick={() => removeSpec(idx)}
                      disabled={specs.length === 1}
                      title="Xóa thông số"
                    >
                      ×
                    </button>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tiêu đề thông số"
                          value={spec.spec_title}
                          onChange={(e) => handleSpecChange(idx, 'spec_title', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tên thông số"
                          value={spec.spec_name}
                          onChange={(e) => handleSpecChange(idx, 'spec_name', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Giá trị thông số"
                          value={spec.spec_value}
                          onChange={(e) => handleSpecChange(idx, 'spec_value', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addSpec}
                >
                  + Thêm thông số
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
              <button type="submit" className="btn btn-primary">
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}
