"use client";

export default function ForgotPass() {
  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Quên Mật Khẩu</h3>

            <form action="/forgot-password" method="POST">
              {/* Nhập email hoặc số điện thoại */}
              <div className="mb-3">
                <label htmlFor="emailOrPhone" className="form-label">
                  Email hoặc Số điện thoại:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  required
                  placeholder="Nhập email hoặc số điện thoại"
                />
              </div>

              {/* Nút gửi OTP */}
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary">
                  Gửi mã OTP
                </button>
              </div>

              {/* Link quay lại đăng nhập */}
              <p className="text-center mb-0">
                Quay lại{" "}
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
