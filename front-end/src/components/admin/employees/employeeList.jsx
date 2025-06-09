'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import AddEmployeeModal from './EmployeeModal/add'; // modal thêm nhân viên
import EmployeeDetailModal from './EmployeeModal/view'; // modal chi tiết nhân viên bạn tạo theo gợi ý trước
import UpdateEmployeeModal from './EmployeeModal/update';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/employees');
      setEmployees(res.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error);
    }
  };

    const openUpdateModal = (id) => {
        setSelectedEmployeeId(id);
        setShowUpdateModal(true);
    };

    const closeUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedEmployeeId(null);
    };


  // Khi bấm nút xem chi tiết, set id và bật modal chi tiết
  const openDetailModal = (id) => {
    setSelectedEmployeeId(id);
    setShowDetailModal(true);
  };

  // Đóng modal chi tiết thì reset id luôn
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEmployeeId(null);
  };

  return (
    <div className="container p-3">
      <h2 className="d-flex justify-content-between align-items-center">
        Danh sách nhân viên
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowAddModal(true)}
        >
          Thêm nhân viên
        </button>
      </h2>

      <table className="table table-bordered table-hover mt-3">
        <thead className="table-secondary">
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                Không có nhân viên nào.
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr key={emp.id_employee}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.phone}</td>
                <td>
                  {emp.block ? (
                    <span className="badge bg-danger">Bị chặn</span>
                  ) : (
                    <span className="badge bg-success">Hoạt động</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-1"
                    onClick={() => openDetailModal(emp.id_employee)}
                  >
                    Xem thêm
                  </button>

                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => openUpdateModal(emp.id_employee)}
                  >
                    Sửa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal chi tiết nhân viên */}
      {showDetailModal && (
        <EmployeeDetailModal
          show={showDetailModal}
          onClose={closeDetailModal}
          employeeId={selectedEmployeeId}
        />
      )}

      {/* Modal thêm nhân viên */}
      <AddEmployeeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchEmployees();
          setShowAddModal(false);
        }}
      />
        <UpdateEmployeeModal
            show={showUpdateModal}
            onClose={closeUpdateModal}
            employeeId={selectedEmployeeId}
            onUpdated={fetchEmployees}
        />

    </div>
    
  );
}
