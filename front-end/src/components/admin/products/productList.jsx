"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import AddProductModal from "./form/addProduct";
import EditProductModal from "./form/updateProduct"; // đường dẫn tương ứng

const initialProducts = [];

export default function ProductList() {
  const [products, setProducts] = useState(initialProducts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (newProductData) => {
    try {
      const formData = new FormData();
      Object.keys(newProductData).forEach((key) => {
        if (key === "images") {
          newProductData.images.forEach((img) => {
            formData.append("images", img);
          });
        } else {
          formData.append(key, newProductData[key]);
        }
      });
      await axios.post("http://localhost:5000/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
    }
  };

  const togglePrimary = async (productId, currentPrimary) => {
    try {
      await axios.patch(`http://localhost:5000/api/products/${productId}/toggle-primary`, {
        products_primary: currentPrimary === 2 ? 1 : 2,
      });
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi cập nhật ghim:", err);
    }
  };

  const getStatusText = (status) => {
    switch (Number(status)) {
      case 1:
        return "Đang chờ duyệt";
      case 2:
        return "Đang hiển thị";
      case 3:
        return "Đã ẩn";
      default:
        return "Không xác định";
    }
  };

  // Mở modal sửa và set sản phẩm chọn
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  // Xử lý sau khi update thành công
  const handleUpdateProduct = () => {
    fetchProducts();
    setShowEditModal(false);
  };

  return (
    <div className="container p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách sản phẩm</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          Thêm sản phẩm
        </button>
      </div>

      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : (
        <table className="table table-bordered table-hover mt-3">
          <thead className="table-secondary">
            <tr>
              <th>Tên sản phẩm</th>
              <th>Hình ảnh</th>
              <th>Giá thị trường</th>
              <th>Giá bán</th>
              <th>Ghim</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.products_id}>
                <td>{product.products_name}</td>
                <td>
                  <img
                    src={`http://localhost:5000/api/products/uploads/${product.Img_url}`}
                    alt=""
                    width="80"
                    height="80"
                    style={{ objectFit: "cover" }}
                  />
                </td>
                <td>{product.market_price.toLocaleString("vi-VN")} ₫</td>
                <td>{product.sale_price.toLocaleString("vi-VN")} ₫</td>
                <td>
                  {product.products_primary === 2 ? (
                    <span className="badge bg-success">Đã ghim</span>
                  ) : (
                    <span className="badge bg-secondary">Chưa ghim</span>
                  )}
                </td>
                <td>{getStatusText(product.products_status)}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => handleEditClick(product)}
                  >
                    Xem
                  </button>
                  <button
                    className={`btn btn-sm ${
                      product.products_primary === 2 ? "btn-warning" : "btn-success"
                    }`}
                    onClick={() => togglePrimary(product.products_id, product.products_primary)}
                  >
                    {product.products_primary === 2 ? "Bỏ ghim" : "Ghim"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal thêm */}
      <AddProductModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
      />

      {/* Modal sửa */}
      {selectedProduct && (
        <EditProductModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          productData={selectedProduct}
          onUpdate={handleUpdateProduct}
        />
      )}
    </div>
  );
}
