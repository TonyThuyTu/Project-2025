'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Tổng quan" },
  { href: "/admin/banner", label: "Quảng cáo" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/reviews", label: "Bình luận" },
  // { href: "/admin/categories", label: "Danh mục" },
  // { href: "/admin/products", label: "Sản phẩm" },
  // { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/customers", label: "Khách hàng" },
  { href: "/admin/employee", label: "Nhân viên" },
  { href: "/admin/contact", label: "Liên hệ" },
  // { href: "/admin/voucher", label: "Voucher" },
  // { href: "/admin/returns", label: "Đổi trả hàng" },
  // { href: "/admin/analytics", label: "Thống kê" },
  // { href: "/admin/settings", label: "Cài đặt" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="d-flex flex-column flex-shrink-0 p-3 bg-light" style={{width: "250px", height: "100vh"}}>
      <a href="/admin/dashboard" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
        <span className="fs-4 fw-bold">Admin</span>
      </a>
      <hr />
      <nav className="nav nav-pills flex-column">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${pathname === link.href ? "active" : "text-dark"}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
