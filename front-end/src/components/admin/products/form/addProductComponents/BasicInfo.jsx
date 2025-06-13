export default function BasicInfo ({ productName, setProductName }) {

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
        <label htmlFor="marketPrice" className="form-label">Giá thị trường</label>
        <input type="number" className="form-control" id="marketPrice" placeholder="Nhập giá thị trường" />
        </div>

        <div className="mb-3">
        <label htmlFor="salePrice" className="form-label">Giá bán</label>
        <input type="number" className="form-control" id="salePrice" placeholder="Nhập giá bán" />
        </div>
        </>
    );

};