"use client";

import { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import AddCategoryModal from './form/addCategory';
import EditCategoryModal from './form/updateCatogory';

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get('http://localhost:5000/api/categories');
    setCategories(res.data);
  };

  const toggleActive = async (id) => {
    await axios.patch(`http://localhost:5000/api/categories/${id}/is_active`);
    fetchCategories();
  };

  const togglePrimary = async (id) => {
    await axios.patch(`http://localhost:5000/api/categories/${id}/is_primary`);
    fetchCategories();
  };

  const handleCreateSubCategory = async (parentId) => {
    const name = prompt('Nhập tên danh mục con:');
    if (name) {
      await axios.post('http://localhost:5000/api/categories', { name, parent_id: parentId });
      fetchCategories();
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setShowEditModal(true);
    };


  const parentCategories = categories.filter((c) => !c.parent_id);
  const getSubCategories = (parentId) => categories.filter((c) => c.parent_id === parentId);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Quản lý danh mục</h2>
        <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
        + Thêm danh mục
        </button>
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Tên danh mục</th>
            <th>Ảnh Banner</th>
            <th>Trạng thái</th>
            <th>Trang chủ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {parentCategories.map((parent) => (
            <Fragment key={parent.category_id}>
              <tr className="table-primary">
                <td>
                  <div className="d-flex justify-content-between align-items-center">
                    {parent.name}
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        setExpanded(expanded === parent.category_id ? null : parent.category_id)
                      }
                    >
                      {expanded === parent.category_id ? '▲' : '▼'}
                    </button>
                  </div>
                </td>
                <td>
                {parent.img ? (
                    <img
                    src={`http://localhost:5000/uploads/${parent.img}`}
                    alt={parent.name}
                    style={{ width: '100px', height: 'auto' }}
                    />
                ) : (
                    '—'
                )}
                </td>
                <td>{parent.is_active ? 'Ẩn' : 'Hiển thị'}</td>
                <td>{parent.is_primary ? 'Đang ghim' : 'Không'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-success me-1"
                    onClick={() => handleCreateSubCategory(parent.category_id)}
                  >
                    + Thêm danh mục con
                  </button>
                  <button
                    className="btn btn-sm btn-warning me-1"
                    onClick={() => handleEdit(parent)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-info me-1"
                    onClick={() => togglePrimary(parent.category_id)}
                  >
                    {parent.is_primary ? 'Bỏ ghim' : 'Ghim'}
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => toggleActive(parent.category_id)}
                  >
                    {parent.is_active ? 'Hiển thị' : 'Ẩn'}
                  </button>
                </td>
              </tr>

              {/* Danh mục con */}
              {expanded === parent.category_id &&
                getSubCategories(parent.category_id).map((sub) => (
                  <tr key={sub.category_id} className="table-light">
                    <td className="ps-4">↳ {sub.name}</td>
                    <td>
                        <p>No img</p>
                    </td>
                    <td>{sub.is_active ? 'Ẩn' : 'Hiện'}</td>
                    <td>{sub.is_primary ? 'Đang ghim' : 'Không'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-1"
                        onClick={() => handleEdit(sub)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-info me-1"
                        onClick={() => togglePrimary(sub.category_id)}
                      >
                        {sub.is_primary ? 'Bỏ ghim' : 'Ghim'}
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => toggleActive(sub.category_id)}
                      >
                        {sub.is_active ? 'Hiện' : 'Ẩn'}
                      </button>
                    </td>
                  </tr>
                ))}
            </Fragment>
          ))}
        </tbody>
      </table>
      <AddCategoryModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={fetchCategories}
        />

        <EditCategoryModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={fetchCategories}
        category={editCategory}
        />

    </div>

    
    
  );
}
