"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const HeaderClient = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);

  // Kiểm tra trạng thái đăng nhập và trạng thái chặn user
  // Gọi 1 lần để load danh mục cha
  useEffect(() => {
    axios.get("http://localhost:5000/api/categories/parent")
      .then(res => setParentCategories(res.data))
      .catch(err => console.error("Lỗi load danh mục:", err));
  }, []);

  // Kiểm tra trạng thái đăng nhập và bị chặn (mỗi 10s)
  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/customers/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = res.data;

        if (user.status === false) {
          alert(`Tài khoản của bạn đã bị chặn: ${user.block_reason || "Không rõ lý do"}`);
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/login');
        } else {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Lỗi khi xác thực token:", err);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        router.push('/login');
      }
    };

    checkStatus(); // lần đầu
    const interval = setInterval(checkStatus, 10000); // mỗi 10s

    window.addEventListener('storage', checkStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkStatus);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <>
      {/* Navbar trên cùng */}
      <nav className="navbar navbar-expand-lg bg-dark navbar-light d-none d-lg-block" id="templatemo_nav_top">
        <div className="container text-light">
          <div className="w-100 d-flex justify-content-between">
            <div>
              <i className="fa fa-envelope mx-2"></i>
              <a className="navbar-sm-brand text-light text-decoration-none" href="mailto:tonybuoisang@gmail.com">tonybuoisang@gmail.com</a>
              <i className="fa fa-phone mx-2"></i>
              <a className="navbar-sm-brand text-light text-decoration-none" href="tel:0777527125">0777527125</a>
            </div>
            <div>
              <a className="text-light" href="https://fb.com/templatemo" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f fa-sm fa-fw me-2"></i></a>
              <a className="text-light" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram fa-sm fa-fw me-2"></i></a>
              <a className="text-light" href="https://twitter.com/" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter fa-sm fa-fw me-2"></i></a>
              <a className="text-light" href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin fa-sm fa-fw"></i></a>
            </div>
          </div>
        </div>
      </nav>

      {/* Navbar chính */}
      <nav className="navbar navbar-expand-lg navbar-light shadow">
        <div className="container d-flex justify-content-between align-items-center">
          <Link href="/" className="navbar-brand text-success logo h1 align-self-center">
            Táo Bro
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#templatemo_main_nav" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="align-self-center collapse navbar-collapse flex-fill d-lg-flex justify-content-lg-between" id="templatemo_main_nav">
            <div className="flex-fill">
              <ul className="nav navbar-nav d-flex justify-content-between mx-lg-auto">
                <li className="nav-item">
                  <Link href="/" className="nav-link">Trang Chủ</Link>
                </li>
                <li className="nav-item">
                  <Link href="/aboutUs" className="nav-link">Giới Thiệu</Link>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="productDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Sản phẩm
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="productDropdown">
                    {parentCategories.map(cat => (
                      <li key={cat.category_id}>
                        <Link href={`/products/${cat.name}`} className="dropdown-item">
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="nav-item">
                  <Link href="/contact" className="nav-link">Liên Hệ</Link>
                </li>
              </ul>
            </div>

            <div className="navbar align-self-center d-flex">
              <div className="d-lg-none flex-sm-fill mt-3 mb-4 col-7 col-sm-auto pr-3">
                <div className="input-group">
                  <input type="text" className="form-control" id="inputMobileSearch" placeholder="Search ..." />
                  <div className="input-group-text">
                    <i className="fa fa-fw fa-search"></i>
                  </div>
                </div>
              </div>

              <a className="nav-icon d-none d-lg-inline" href="#" data-bs-toggle="modal" data-bs-target="#templatemo_search">
                <i className="fa fa-fw fa-search text-dark mr-2"></i>
              </a>

              <a className="nav-icon position-relative text-decoration-none" href="#">
                <i className="fa fa-fw fa-cart-arrow-down text-dark mr-1"></i>
                <span className="position-absolute top-0 left-100 translate-middle badge rounded-pill bg-light text-dark">7</span>
              </a>

              <div className="dropdown">
                <a
                  className="nav-icon position-relative text-decoration-none"
                  href="#"
                  id="accountDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fa fa-fw fa-user text-dark"></i>
                </a>
                <ul className="dropdown-menu dropdown-menu-end mt-2" aria-labelledby="accountDropdown">
                  {!isLoggedIn ? (
                    <>
                      <li>
                        <Link href="/login" className="dropdown-item">Đăng nhập</Link>
                      </li>
                      <li>
                        <Link href="/register" className="dropdown-item">Đăng ký</Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link href="/profile" className="dropdown-item">Tài khoản</Link>
                      </li>
                      <li>
                        <a onClick={handleLogout} className="dropdown-item" style={{ cursor: 'pointer' }}>
                          Đăng xuất
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal search */}
      <div className="modal fade bg-white" id="templatemo_search" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-lg" role="document">
          <div className="w-100 pt-1 mb-5 text-right">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form className="modal-content modal-body border-0 p-0">
            <div className="input-group mb-2">
              <input type="text" className="form-control" id="inputModalSearch" name="q" placeholder="Search ..." />
              <button type="submit" className="input-group-text bg-success text-light">
                <i className="fa fa-fw fa-search text-white"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default HeaderClient;