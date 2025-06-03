"use client"
import { useState } from "react";

export default function SginIn() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Đăng Nhập</h3>

            <form action="/login" method="POST">
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email:
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  required
                  placeholder="Nhập email"
                />
              </div>

              {/* Mật khẩu có con mắt */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Mật khẩu:
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="password"
                    name="password"
                    required
                    placeholder="Nhập mật khẩu"
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={togglePassword}
                  >
                    <i className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </span>
                </div>
              </div>

              {/* Ghi nhớ + Quên mật khẩu */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="remember"
                    name="remember"
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Ghi nhớ
                  </label>
                </div>
                <a href="/forgot-pass" className="text-decoration-none">
                  Quên mật khẩu?
                </a>
              </div>

              {/* Nút Đăng nhập */}
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary">
                  Đăng Nhập
                </button>
              </div>

              {/* Chưa có tài khoản */}
              <p className="text-center mb-0">
                Chưa có tài khoản?{" "}
                <a href="/register" className="text-primary text-decoration-none">
                  Đăng ký
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
