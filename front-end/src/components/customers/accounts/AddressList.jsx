"use client";
import { useState } from "react";
import AddAddressModal from "./AddressModals/add";
import ViewAddressModal from "./AddressModals/view";
import UpdateAddress from "./AddressModals/update";

export default function AddressList() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: "Nhà riêng",
      city: "TP.HCM",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      street: "123 Đường Lê Lợi",
      isPrimary: true,
    },
    // Bạn có thể thêm data thật ở đây
    {
      id: 2,
      label: "Cơ quan",
      city: "Đà Nẵng",
      district: "Quận Hải Châu",
      ward: "Phường Tân Chính",
      street: "123 Hoàng Hoa Thám",
      isPrimary: false,
    },

    {
      id: 3,
      label: "Nhà riêng",
      city: "TP.HCM",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      street: "123 Đường Lê Lợi",
      isPrimary: false,
    },

    {
      id: 4,
      label: "Nhà riêng",
      city: "TP.HCM",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      street: "123 Đường Lê Lợi",
      isPrimary: false,
    },
  ]);

  return (
    <div>
    
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5>Danh sách địa chỉ</h5>
        <button
          type="button"
          className="btn btn-success"
          data-bs-toggle="modal"
          data-bs-target="#modalAddAddress"
        >
          + Thêm địa chỉ
        </button>
      </div>

      <ul className="list-group" style={{ maxHeight: "300px", overflowY: "auto" }}>
        {addresses.map((address) => (
          <li key={address.id} className="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <div>
                <strong>{address.label}</strong>
                {address.isPrimary && <span className="badge bg-success ms-2">Mặc định</span>}
              </div>
              <div>
                {address.street}, {address.ward}, {address.district}, {address.city}
              </div>
            </div>

            <div>
              <button
                className="btn btn-sm btn-info me-1"
                data-bs-toggle="modal"
                data-bs-target={`#modalViewAddress${address.id}`}
            >
                Xem
            </button>

              <button
                type="button"
                className="btn btn-sm btn-warning me-1"
                data-bs-toggle="modal"
                data-bs-target={`#modalEditAddress${address.id}`}
                >
                Sửa
            </button>


              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => {
                  if (confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
                    setAddresses((prev) => prev.filter((a) => a.id !== address.id));
                  }
                }}
              >
                Xóa
              </button>

            </div>

            {/* Model xem chi tiết địa chỉ */}
            <ViewAddressModal
            key={`modal-${address.id}`}
            address={address}
            modalId={`modalViewAddress${address.id}`}
            />
            {/* Model chỉnh sửa địa chỉ */}
            <UpdateAddress
            key={`edit-modal-${address.id}`}
            address={address}
            modalId={`modalEditAddress${address.id}`}
            />

          </li>
        ))}
      </ul>

      {/* Modal Thêm địa chỉ */}
      <AddAddressModal />

      
    </div>
  );
}
