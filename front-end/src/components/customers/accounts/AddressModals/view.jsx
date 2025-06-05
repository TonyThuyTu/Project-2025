"use client";

export default function ViewAddressModal({ address, modalId }) {
  if (!address) return null; // Nếu chưa có dữ liệu thì không render

  return (
    <div
      className="modal fade"
      id={modalId}
      tabIndex="-1"
      aria-labelledby={`${modalId}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${modalId}Label`}>
              Chi tiết địa chỉ
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Đóng"
            ></button>
          </div>
          <div className="modal-body">
            <dl className="row">
              <dt className="col-sm-4">Tên địa chỉ</dt>
              <dd className="col-sm-8">{address.label}</dd>

              <dt className="col-sm-4">Thành phố / Tỉnh</dt>
              <dd className="col-sm-8">{address.city}</dd>

              <dt className="col-sm-4">Quận / Huyện</dt>
              <dd className="col-sm-8">{address.district}</dd>

              <dt className="col-sm-4">Phường / Xã</dt>
              <dd className="col-sm-8">{address.ward}</dd>

              <dt className="col-sm-4">Số nhà, tên đường</dt>
              <dd className="col-sm-8">{address.street}</dd>

              <dt className="col-sm-4">Địa chỉ mặc định</dt>
              <dd className="col-sm-8">{address.isPrimary ? "Có" : "Không"}</dd>
            </dl>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
