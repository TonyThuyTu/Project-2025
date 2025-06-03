"use client";

import { useState } from "react";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Đăng Ký</h3>

            <form action="/register" method="POST">
              {/* Tên */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Tên:</label>
                <input type="text" className="form-control" id="name" name="name" required placeholder="Nhập tên" />
              </div>

              {/* Số điện thoại */}
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Số điện thoại:</label>
                <input type="tel" className="form-control" id="phone" name="phone" required placeholder="Nhập số điện thoại" />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email:</label>
                <input type="email" className="form-control" id="email" name="email" required placeholder="Nhập email" />
              </div>

              {/* Mật khẩu */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Mật khẩu:</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="password"
                    name="password"
                    required
                    placeholder="Nhập mật khẩu"
                  />
                  <span className="input-group-text" style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </span>
                </div>
              </div>

              {/* Nhập lại mật khẩu */}
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Nhập lại mật khẩu:</label>
                <div className="input-group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    placeholder="Nhập lại mật khẩu"
                  />
                  <span className="input-group-text" style={{ cursor: "pointer" }} onClick={() => setShowConfirm(!showConfirm)}>
                    <i className={`fa ${showConfirm ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </span>
                </div>
              </div>

              {/* Nút Đăng ký */}
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary">Đăng Ký</button>
              </div>

              {/* Đã có tài khoản */}
              <p className="text-center mb-0">
                Đã có tài khoản? <a href="/login" className="text-primary text-decoration-none">Đăng nhập</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
