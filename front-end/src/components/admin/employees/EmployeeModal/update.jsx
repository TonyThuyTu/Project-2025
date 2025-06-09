'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UpdateEmployeeModal({ show, onClose, employeeId, onUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    position: '',
    status: ''
  });
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (employeeId && show) {
      axios.get(`http://localhost:5000/api/employees/${employeeId}`)
        .then((res) => {
          const emp = res.data;
          setFormData({
            name: emp.name || '',
            phone: emp.phone || '',
            email: emp.email || '',
            password: '',
            position: emp.position || '',
            status: emp.status || '',
          });
          setRole(emp.role || '');
        })
        .catch(() => setError('Không thể tải dữ liệu nhân viên'));
    }
  }, [employeeId, show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/employees/${employeeId}`, formData);
      onUpdated?.(); // reload danh sách sau khi cập nhật
      onClose();     // đóng modal
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Cập nhật nhân viên</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Họ tên</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Mật khẩu mới (bỏ qua nếu không đổi)</label>
                <div className="input-group">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    />
                    <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                    </button>
                </div>
                </div>

              <div className="mb-3">
                <label className="form-label">Vị trí</label>
                <input type="text" className="form-control" name="position" value={formData.position} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Trạng thái</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="active">Đang đi làm</option>
                  <option value="inactive">Đang Nghỉ Phép</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Vai trò</label>
                <input type="text" className="form-control" value={role} disabled />
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
