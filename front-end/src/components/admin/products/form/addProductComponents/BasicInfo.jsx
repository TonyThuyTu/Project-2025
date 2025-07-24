
export default function BasicInfo({
  productName,
  setProductName,
  marketPrice,
  setMarketPrice,
  salePrice,
  setSalePrice,
  productQuantity,
  setProductQuantity,
  productShorts,
  setProductShorts,
}) {
  const formatCurrency = (value) => {
    const number = value.replace(/\D/g, ""); // chỉ giữ số
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // thêm dấu chấm
  };

  // Xử lý khi người dùng gõ giá thị trường
  const handleMarketPriceChange = (e) => {
    const raw = e.target.value.replace(/\./g, "");
    setMarketPrice(formatCurrency(raw));
  };

  // Xử lý khi người dùng gõ giá bán
  const handleSalePriceChange = (e) => {
    const raw = e.target.value.replace(/\./g, "");
    setSalePrice(formatCurrency(raw));
  };

  return (
    <>
      <div className="mb-3">
        <label htmlFor="productName" className="form-label">Tên sản phẩm</label>
        <input
          type="text"
          className="form-control"
          id="productName"
          placeholder="Nhập tên sản phẩm"
          value={productName}
          onChange={e => setProductName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="productShorts" className="form-label">Mô tả ngắn</label>
        <input
          type="text"
          className="form-control"
          id="productShorts"
          placeholder="Nhập mô tả ngắn"
          value={productShorts}
          onChange={(e) => setProductShorts(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="marketPrice" className="form-label">Giá thị trường</label>
        <input
          type="text"
          className="form-control"
          id="marketPrice"
          placeholder="Nhập giá thị trường"
          value={marketPrice}
          onChange={handleMarketPriceChange}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="salePrice" className="form-label">Giá bán</label>
        <input
          type="text"
          className="form-control"
          id="salePrice"
          placeholder="Nhập giá bán"
          value={salePrice}
          onChange={handleSalePriceChange}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="salePrice" className="form-label">Số lượng</label>
        <input
          type="number"
          min={0}
          className="form-control"
          id="productQuantity"
          placeholder="Nhập số lượng"
          value={productQuantity}
          onChange={(e) => setProductQuantity(Number(e.target.value))}
        />
      </div>
    </>
  );
}
