"use client";

export default function UpdateAddressModal({ address, modalId }) {
  if (!address) return null; // Đảm bảo có dữ liệu trước khi render

  return (
    <div
      className="modal fade"
      id={modalId}
      tabIndex="-1"
      aria-labelledby={`${modalId}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <form method="POST" action="/edit-address" className="modal-content">
          <input type="hidden" name="address_id" value={address.id} />
          <div className="modal-header">
            <h5 className="modal-title" id={`${modalId}Label`}>Sửa địa chỉ</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Đóng"
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor={`address_label_edit${address.id}`} className="form-label">Tên địa chỉ</label>
              <input
                type="text"
                className="form-control"
                id={`address_label_edit${address.id}`}
                name="address_label"
                maxLength="50"
                defaultValue={address.label}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor={`name_city_edit${address.id}`} className="form-label">Thành phố / Tỉnh</label>
              <input
                type="text"
                className="form-control"
                id={`name_city_edit${address.id}`}
                name="name_city"
                maxLength="255"
                defaultValue={address.city}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor={`name_district_edit${address.id}`} className="form-label">Quận / Huyện</label>
              <input
                type="text"
                className="form-control"
                id={`name_district_edit${address.id}`}
                name="name_district"
                maxLength="255"
                defaultValue={address.district}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor={`name_ward_edit${address.id}`} className="form-label">Phường / Xã</label>
              <input
                type="text"
                className="form-control"
                id={`name_ward_edit${address.id}`}
                name="name_ward"
                maxLength="255"
                defaultValue={address.ward}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor={`name_address_edit${address.id}`} className="form-label">Số nhà, tên đường</label>
              <textarea
                className="form-control"
                id={`name_address_edit${address.id}`}
                name="name_address"
                rows="2"
                maxLength="255"
                defaultValue={address.street}
                required
              />
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`is_primary_edit${address.id}`}
                name="is_primary"
                value="true"
                defaultChecked={address.isPrimary}
              />
              <label className="form-check-label" htmlFor={`is_primary_edit${address.id}`}>
                Địa chỉ mặc định
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
}
