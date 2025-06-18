"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import AddProductModal from "./form/addProduct";
import EditProductModal from "./form/updateProduct";
import { useRouter, useSearchParams } from "next/navigation";

const initialProducts = [];

export default function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Lấy id từ query string ?id=44

  const [products, setProducts] = useState(initialProducts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/products/${id}`);
          setSelectedProduct(res.data);
          setShowEditModal(true);
        } catch (error) {
          console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
          setSelectedProduct(null);
          setShowEditModal(false);
          router.push("/admin/products"); // Nếu id sai => quay lại danh sách
        }
      })();
    } else {
      setSelectedProduct(null);
      setShowEditModal(false);
    }
  }, [id, router]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      console.log("Data products từ BE:", res.data);
      setProducts(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
      fetchProducts();
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
        return <span style={{ color: "#f39c12" }}>Đang chờ duyệt</span>; // vàng
      case 2:
        return <span style={{ color: "#27ae60" }}>Đang hiển thị</span>; // xanh lá
      case 3:
        return <span style={{ color: "#e74c3c" }}>Đã ẩn</span>;         // đỏ
      default:
        return <span style={{ color: "#7f8c8d" }}>Không xác định</span>; // xám
    }
  };

  // Bấm xem sẽ chuyển URL sang ?id=... để mở modal
  const handleEditClick = (product) => {
    router.push(`/admin/products?id=${product.products_id}`);
  };

  // Đóng modal sửa sẽ quay về danh sách (bỏ ?id)
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    router.push("/admin/products");
  };

  // Sau khi update thành công
  const handleUpdateProduct = () => {
    fetchProducts();
    handleCloseEditModal();
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
            {products.map((product) => {
              

              return (
                <tr key={product.products_id}>
                  <td>{product.products_name}</td>
                  <td>
                    <img
                      src={
                        product.main_image_url
                          ? `http://localhost:5000${product.main_image_url}`
                          : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                      }
                      alt="ảnh sản phẩm"
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
              );
            })}
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
          onClose={handleCloseEditModal}
          productData={selectedProduct}
          onUpdate={handleUpdateProduct}
        />
      )}
    </div>
  );
}
