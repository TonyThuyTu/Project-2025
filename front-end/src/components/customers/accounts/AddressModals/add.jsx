"use client";

export default function AddAddressModal() {
  return (
    <div
      className="modal fade"
      id="modalAddAddress"
      tabIndex="-1"
      aria-labelledby="modalAddAddressLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <form className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="modalAddAddressLabel">Thêm địa chỉ</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Đóng" />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="address_label_add" className="form-label">Tên địa chỉ</label>
              <input type="text" className="form-control" id="address_label_add" required />
            </div>
            <div className="mb-3">
              <label htmlFor="name_city_add" className="form-label">Thành phố / Tỉnh</label>
              <input type="text" className="form-control" id="name_city_add" required />
            </div>
            <div className="mb-3">
              <label htmlFor="name_district_add" className="form-label">Quận / Huyện</label>
              <input type="text" className="form-control" id="name_district_add" required />
            </div>
            <div className="mb-3">
              <label htmlFor="name_ward_add" className="form-label">Phường / Xã</label>
              <input type="text" className="form-control" id="name_ward_add" required />
            </div>
            <div className="mb-3">
              <label htmlFor="name_address_add" className="form-label">Số nhà, tên đường</label>
              <textarea className="form-control" id="name_address_add" rows="2" required />
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="is_primary_add" />
              <label className="form-check-label" htmlFor="is_primary_add">Địa chỉ mặc định</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="submit" className="btn btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
