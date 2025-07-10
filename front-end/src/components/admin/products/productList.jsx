"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import AddProductModal from "./form/addProduct";
import EditProductModal from "./form/updateProduct";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Row, Col } from "react-bootstrap";

export default function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [categories, setCategories] = useState([]);          // tất cả danh mục (cha + con)
  const [parentCategories, setParentCategories] = useState([]); // danh mục cha
  const [childCategories, setChildCategories] = useState([]);   // danh mục con theo cha

  const [selectedParentCategory, setSelectedParentCategory] = useState("");
  const [selectedChildCategory, setSelectedChildCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPrimary, setSelectedPrimary] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load danh mục lần đầu (cha + con)
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load sản phẩm và các modal khi có id
  useEffect(() => {
    if (!id) {
      setSelectedProduct(null);
      setShowEditModal(false);
      return;
    }

    const fetchProduct = async () => {
      setSelectedProduct(null); // clear cũ
      setShowEditModal(false);  // đóng modal để đợi data mới

      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setSelectedProduct(res.data);
        setShowEditModal(true); // mở lại khi có dữ liệu
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
        router.push("/admin/products");
      }
    };

    fetchProduct();
  }, [id]);


  // Khi chọn danh mục cha => cập nhật danh mục con tương ứng
  useEffect(() => {
    if (selectedParentCategory) {
      const children = categories.filter(
        (c) => c.parent_id === parseInt(selectedParentCategory)
      );
      setChildCategories(children);
      setSelectedChildCategory(""); // reset con khi đổi cha
    } else {
      setChildCategories([]);
      setSelectedChildCategory("");
    }
  }, [selectedParentCategory, categories]);

  // Lọc sản phẩm theo các bộ lọc và tìm kiếm
  useEffect(() => {
    let result = [...products];

    // Tìm kiếm theo tên
    if (searchKeyword) {
      result = result.filter(p =>
        p.products_name.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // Lọc theo danh mục cha => lọc sản phẩm có category_parent_id trùng cha
    if (selectedParentCategory) {
      result = result.filter(p => p.category_parent_id === parseInt(selectedParentCategory));
    }

    // Lọc theo danh mục con (đã chọn)
    if (selectedChildCategory) {
      result = result.filter(p => p.category_id === parseInt(selectedChildCategory));
    }

    // Lọc theo trạng thái
    if (selectedStatus) {
      result = result.filter(p => p.products_status === parseInt(selectedStatus));
    }

    // Lọc theo ghim (true/false)
    if (selectedPrimary) {
      const primaryBool = selectedPrimary === "true";
      result = result.filter(p => Boolean(p.products_primary) === primaryBool);
    }

    setFilteredProducts(result);
  }, [products, searchKeyword, selectedParentCategory, selectedChildCategory, selectedStatus, selectedPrimary]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi danh sách sản phẩm lần đầu
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
      const parents = res.data.filter(c => c.parent_id === null);
      setParentCategories(parents);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
    }
  };

  const handleAddProduct = () => {
    fetchProducts();
  };

  const handleUpdateProduct = () => {
    fetchProducts();
    router.push("/admin/products");
  };

  const togglePrimary = async (productId, currentPrimary) => {
    try {
      await axios.patch(`http://localhost:5000/api/products/${productId}/toggle-primary`, {
        products_primary: !currentPrimary,
      });
      fetchProducts();
    } catch (err) {
      console.error("Lỗi khi cập nhật ghim:", err);
    }
  };

  const getStatusText = (status) => {
    switch (Number(status)) {
      case 1:
        return <span style={{ color: "#f39c12" }}>Chờ duyệt</span>;
      case 2:
        return <span style={{ color: "#27ae60" }}>Hiển thị</span>;
      case 3:
        return <span style={{ color: "#e74c3c" }}>Đã ẩn</span>;
      default:
        return <span style={{ color: "#7f8c8d" }}>Không xác định</span>;
    }
  };

  return (
    <div className="container p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách sản phẩm</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          Thêm sản phẩm
        </button>
      </div>

      {/* Bộ lọc */}
      <Row className="mb-3" style={{ gap: "10px" }}>
        <Col md={2}>
          <Form.Control
            placeholder="Tìm sản phẩm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </Col>

        <Col md={2}>
          <Form.Select
            value={selectedParentCategory}
            onChange={(e) => setSelectedParentCategory(e.target.value)}
            aria-label="Lọc theo danh mục cha"
          >
            <option value="">Danh mục cha</option>
            {parentCategories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Select
            value={selectedChildCategory}
            onChange={(e) => setSelectedChildCategory(e.target.value)}
            aria-label="Lọc theo danh mục con"
            disabled={!childCategories.length}
          >
            <option value="">Danh mục con</option>
            {childCategories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Lọc theo trạng thái"
          >
            <option value="">Trạng thái</option>
            <option value="1">Chờ duyệt</option>
            <option value="2">Hiển thị</option>
            <option value="3">Đã ẩn</option>
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Select
            value={selectedPrimary}
            onChange={(e) => setSelectedPrimary(e.target.value)}
            aria-label="Lọc theo ghim"
          >
            <option value="">-- Lọc theo ghim --</option>
            <option value="true">Đã ghim</option>
            <option value="false">Chưa ghim</option>
          </Form.Select>
        </Col>
      </Row>

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
            {filteredProducts.map((product) => (
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
                  {product.products_primary ? (
                    <span className="badge bg-success">Đã ghim</span>
                  ) : (
                    <span className="badge bg-secondary">Chưa ghim</span>
                  )}
                </td>
                <td>{getStatusText(product.products_status)}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => router.push(`/admin/products?id=${product.products_id}`)}
                  >
                    Xem
                  </button>
                  <button
                    className={`btn btn-sm ${
                      product.products_primary ? "btn-warning" : "btn-success"
                    }`}
                    onClick={() => togglePrimary(product.products_id, product.products_primary)}
                  >
                    {product.products_primary ? "Bỏ ghim" : "Ghim"}
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
