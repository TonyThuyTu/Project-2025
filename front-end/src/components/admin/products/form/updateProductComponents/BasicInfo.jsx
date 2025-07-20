function formatNumber(value) {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function unformatNumber(value) {
  return value.replace(/\./g, "");
}

export default function BasicInfo({
  productName,
  setProductName,
  marketPrice,
  setMarketPrice,
  salePrice,
  setSalePrice,
  productQuantity,
  setProductQuantity
}) {
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
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="marketPrice" className="form-label">Giá thị trường</label>
        <input
          type="text"
          className="form-control"
          id="marketPrice"
          placeholder="Nhập giá thị trường"
          value={formatNumber(marketPrice)}
          onChange={(e) => {
            const raw = unformatNumber(e.target.value);
            if (!isNaN(raw)) {
              setMarketPrice(raw);
            }
          }}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="salePrice" className="form-label">Giá bán</label>
        <input
          type="text"
          className="form-control"
          id="salePrice"
          placeholder="Nhập giá bán"
          value={formatNumber(salePrice)}
          onChange={(e) => {
            const raw = unformatNumber(e.target.value);
            if (!isNaN(raw)) {
              setSalePrice(raw);
            }
          }}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="productQuantity" className="form-label">Số lượng</label>
        <input
          type="text"
          className="form-control"
          id="productQuantity"
          placeholder="Nhập số lượng"
          value={formatNumber(productQuantity)} // ✅ Truyền đúng giá trị
          onChange={(e) => setProductQuantity(Number(e.target.value))}
        />
      </div>
    </>
  );
}
