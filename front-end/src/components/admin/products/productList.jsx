import Image from 'next/image';
import { useState } from 'react';
import AddProductModal from './form/addProduct'; // Đảm bảo đúng đường dẫn

// Khởi tạo dữ liệu mẫu ban đầu cho sản phẩm
const initialProducts = [];

export default function ProductList() {
  const [products, setProducts] = useState(initialProducts);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleEdit = (id) => {
    console.log('Edit product', id);
  };

  const handleToggleHidden = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isHidden: !p.isHidden } : p))
    );
  };

  const handleTogglePinned = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPinned: !p.isPinned } : p))
    );
  };

  return (
    <div className="container p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách sản phẩm</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          Thêm sản phẩm
        </button>
      </div>

      <table className="table table-bordered table-hover mt-3">
        <thead className="table-secondary">
          <tr>
            <th>Tên sản phẩm</th>
            <th>Hình ảnh</th>
            <th>Giá</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                Không có sản phẩm nào.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} style={{ opacity: product.isHidden ? 0.5 : 1 }}>
                <td>
                  {product.name}
                  {product.isPinned && (
                    <span
                      style={{
                        marginLeft: 6,
                        padding: '2px 6px',
                        backgroundColor: '#ff0',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                      }}
                    >
                      Ghim
                    </span>
                  )}
                </td>
                <td style={{ width: '100px', textAlign: 'center' }}>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={80}
                    height={50}
                    style={{ borderRadius: '4px', objectFit: 'cover' }}
                  />
                </td>
                <td>{product.price.toLocaleString('vi-VN')}₫</td>
                <td>{product.description}</td>
                <td>{product.isHidden ? 'Đang ẩn' : 'Đang hiện'}</td>
                <td style={{ minWidth: '200px' }}>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(product.id)}>
                    Sửa
                  </button>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleToggleHidden(product.id)}>
                    {product.isHidden ? 'Hiện' : 'Ẩn'}
                  </button>
                  <button
                    className={`btn btn-sm me-2 ${product.isPinned ? 'btn-secondary' : 'btn-success'}`}
                    onClick={() => handleTogglePinned(product.id)}
                  >
                    {product.isPinned ? 'Bỏ ghim' : 'Ghim'}
                  </button>
                  <button className="btn btn-primary btn-gray" onClick={() => handleEdit(product.id)}>
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal thêm */}
      <AddProductModal show={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddProduct} />
    </div>
  );
}
