"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  // Hàm viết hoa chữ cái đầu mỗi từ
  const capitalizeWords = (str) =>
    str
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  // Validate tên theo yêu cầu
  const validateName = (name) => {
    if (name.trim() === "") return ""; // chưa nhập thì không báo lỗi

    if (/\s{2,}/.test(name))
      return "Tên không được chứa khoảng trắng liên tiếp.";

    if (/^\s|\s$/.test(name))
      return "Tên không được bắt đầu hoặc kết thúc bằng khoảng trắng.";

    if (name.replace(/\s/g, "").length < 7)
      return "Tên phải có ít nhất 7 ký tự (không tính khoảng trắng).";

    return "";
  };

  // Validate từng trường còn lại
  const validateField = (name, value) => {
    switch (name) {
      case "phone":
        if (value === "") return "";
        if (!/^\d{10}$/.test(value)) return "Số điện thoại phải đúng 10 chữ số.";
        return "";

      case "email":
        if (value === "") return "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Email không hợp lệ.";
        return "";

      case "password":
        if (value === "") return "";
        const firstChar = value.charAt(0);
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const digitRegex = /\d/;
        if (firstChar !== firstChar.toUpperCase())
          return "Mật khẩu phải viết hoa chữ cái đầu.";
        if (!specialCharRegex.test(value))
          return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt.";
        if (!digitRegex.test(value)) return "Mật khẩu phải có ít nhất 1 số.";
        return "";

      case "confirmPassword":
        if (value === "") return "";
        if (value !== form.password) return "Mật khẩu nhập lại không khớp.";
        return "";

      default:
        return "";
    }
  };

  // Xử lý nhập input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: validateName(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  // Khi rời input tên thì tự động viết hoa chữ đầu mỗi từ
  const handleNameBlur = () => {
    const capitalized = capitalizeWords(form.name);
    setForm((prev) => ({ ...prev, name: capitalized }));
    setErrors((prev) => ({ ...prev, name: validateName(capitalized) }));
  };

  // Kiểm tra toàn bộ form xem có lỗi hay chưa và tất cả ô đã nhập
  useEffect(() => {
    const noErrors = Object.values(errors).every((err) => err === "");
    const allFilled = Object.values(form).every((val) => val.trim() !== "");
    setCanSubmit(noErrors && allFilled);
  }, [errors, form]);

  // Gửi form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      const res = await fetch("http://localhost:5000/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Đăng ký thất bại.");
      } else {
        alert("Đăng ký thành công!");
        router.push("/login");
        setErrors({
          name: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      alert("Lỗi kết nối server.");
    }
  };

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Đăng Ký</h3>

            <form onSubmit={handleSubmit} noValidate>
              {/* Tên */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Tên:
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleNameBlur}
                  placeholder="Nhập tên"
                  autoComplete="off"
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Số điện thoại:
                </label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  autoComplete="off"
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email:
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  autoComplete="off"
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              {/* Mật khẩu */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Mật khẩu:
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    autoComplete="new-password"
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <i className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </span>
                  {errors.password && (
                    <div className="invalid-feedback d-block">{errors.password}</div>
                  )}
                </div>
              </div>

              {/* Nhập lại mật khẩu */}
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Nhập lại mật khẩu:
                </label>
                <div className="input-group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={`form-control ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowConfirm((prev) => !prev)}
                  >
                    <i className={`fa ${showConfirm ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </span>
                  {errors.confirmPassword && (
                    <div className="invalid-feedback d-block">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>

              {/* Nút Đăng ký */}
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                  Đăng Ký
                </button>
              </div>

              {/* Đã có tài khoản */}
              <p className="text-center mb-0">
                Đã có tài khoản?{" "}
                <a href="/login" className="text-primary text-decoration-none">
                  Đăng nhập
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
